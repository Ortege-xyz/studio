from datetime import datetime, timezone
from flask import g
from flask_appbuilder import Model
from flask_appbuilder.models.sqla.filters import BaseFilter
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship, Query
from typing import Any, Dict

class ApiKeyToken(Model):
    """Model para armazenar tokens do Keycloak"""
    __tablename__ = 'apikey_tokens'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('ab_user.id'), nullable=False)
    token = Column(String(2000), nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)

    # Create a foreign key with the active user 
    user = relationship('User', foreign_keys=[user_id])

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "token": self.token,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
        }

class ApiKeyTokenFilter(BaseFilter):
    """Filter that ensures users can only access their own API keys"""
    
    def apply(self, query: Query, value: Any) -> Query:
        """
        Apply the filter to restrict API key access to the current user
        
        Args:
            query (Query): The base query to filter
            value (Any): Not used in this implementation
            
        Returns:
            Query: The filtered query showing only the current user's API keys
        """
        if not g.user:
            return query.filter(self.model.id < 0)  # Return empty if no user
            
        return query.filter(self.model.user_id == g.user.id)