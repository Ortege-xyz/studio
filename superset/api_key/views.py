from flask_appbuilder import expose
from flask_appbuilder.security.decorators import (
    has_access,
    permission_name,
)
from superset.views.base import BaseSupersetView
from superset.superset_typing import FlaskResponse

class ApiKeysView(BaseSupersetView):
    route_base = "/apikeys"
    class_permission_name = "ApiKeys"

    @expose("/")
    @has_access
    @permission_name("read")
    def list(self) -> FlaskResponse:
        return super().render_app_template()
