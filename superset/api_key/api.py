import jwt
import logging
import requests

from datetime import datetime
from flask import request, g, Response
from flask_appbuilder.api import expose, protect, safe
from flask_appbuilder.models.sqla.interface import SQLAInterface
from superset import app, db
from typing import Any, Dict

from superset.constants import MODEL_API_RW_METHOD_PERMISSION_MAP
from superset.extensions import event_logger
from superset.api_key.models import ApiKeyToken, ApiKeyTokenFilter
from superset.views.base_api import (
    BaseSupersetModelRestApi,
    requires_json,
    statsd_metrics,
)

logger = logging.getLogger(__name__)

class ApiKeysRestApi(BaseSupersetModelRestApi):
    resource_name = "apikeys"
    class_permission_name = "ApiKeysRestApi"
    openapi_spec_tag = "ApiKeys"
    datamodel = SQLAInterface(ApiKeyToken)
    base_filters = [["user_id", ApiKeyTokenFilter, lambda: []]]
    
    # Keycloak config
    KEYCLOAK_CONFIG = {
        "url": app.config.get("KEYCLOAK_URL"),
        "realm": app.config.get("KEYCLOAK_REALM"),
        "client_id": app.config.get("KEYCLOAK_CLIENT_ID"),
        "client_secret": app.config.get("KEYCLOAK_CLIENT_SECRET")
    }

    allow_browser_login = True
    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP
    
    list_columns = ["token", "created_at", "expires_at", "id"]
    show_columns = ["token", "created_at", "expires_at", "id"]
    order_columns = ["created_at", "expires_at"]
    
    def generate_token(self, username: str, password: str) -> tuple:
        """Generate new Token for Keycloak"""
        try:
            token_url = f"{self.KEYCLOAK_CONFIG['url']}/realms/{self.KEYCLOAK_CONFIG['realm']}/protocol/openid-connect/token"
            
            response = requests.post(
                token_url,
                data={
                    "grant_type": "password",
                    "client_id": self.KEYCLOAK_CONFIG['client_id'],
                    "client_secret": self.KEYCLOAK_CONFIG['client_secret'],
                    "username": username,
                    "password": password,
                    "scope": "openid profile email roles"
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Error to generate new token: {response.text}")
                
            token_data = response.json()
            decoded_token = jwt.decode(
                token_data["access_token"],
                options={"verify_signature": False}
            )
            
            return token_data["access_token"], decoded_token
            
        except Exception as e:
            logger.error(f"Error to generate new token: {str(e)}")
            raise

    @expose("/<int:pk>", methods=("GET",))
    @protect()
    @safe
    @statsd_metrics
    def get(self, pk: int) -> Dict[str, Any]:
        """Get specific API key details"""
        try:    
            token = self.datamodel.get(pk)

            if not token:
                return self.response_404()
            
            if token.user_id != g.user.id:
                return self.response_403()
                
            return self.response(200, result=token.to_dict())
        except Exception as e:
            return self.response_500(message=str(e))

    @expose("/", methods=("POST",))
    @protect()
    @safe
    @statsd_metrics
    @requires_json
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.post",
        log_to_statsd=False,
    )
    def post(self) -> Response:
        """Endpoint to create a new token"""
        if not request.is_json:
            return self.response_400(message="Request should be JSON")
        try:
            data = request.json
            required_fields = ["username", "password"]
            
            if not all(field in data for field in required_fields):
                return self.response_400(message=f"Required fields: {', '.join(required_fields)}")
                
            # Generate token
            token, decoded_token = self.generate_token(
                data["username"],
                data["password"]
            )
            
            # Create the record of token in the db
            token_record = ApiKeyToken(
                user_id=g.user.id,
                token=token,
                expires_at=datetime.fromtimestamp(decoded_token["exp"])
            )
            
            db.session.add(token_record)
            db.session.commit()

            response = {
                "message": "Token created successfully.",
                "result": token_record.to_dict()
            }

            return self.response(200, **response)
        except Exception as e:
            db.session.rollback()
            return self.response_500(message=str(e))

    @expose("/<pk>", methods=("DELETE",))
    @protect()
    @safe
    @statsd_metrics
    def delete(self, pk: int) -> Response:
        """Deletes an API Key
        ---
        delete:
            description: >-
            Delete an API Key based on provided token id
            parameters:
            - in: path
            name: pk
            schema:
                type: string
            required: true
            responses:
            200:
                description: API Key deleted
            403:
                description: Unauthorized
            404:
                description: API Key not found
            500:
                description: Internal server error
        """
        try:
            token = self.datamodel.get(pk)

            if not token:
                return self.response_404()
            
            if token.user_id != g.user.id:
                return self.response_403()

            db.session.delete(token)
            db.session.commit()
            
            response = {
                "message": "Token deleted successfully"
            }

            return self.response(200, **response)
        except Exception as e:
            print(e)
            return self.response_500(message=str(e))
