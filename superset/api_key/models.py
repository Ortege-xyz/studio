from datetime import datetime, timezone
from flask_appbuilder import Model
from sqlalchemy import Column, DateTime, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.orm import relationship
from typing import Any, Dict

class ApiKeyToken(Model):
    """Model para armazenar tokens do Keycloak"""
    __tablename__ = 'apikey_tokens'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('ab_user.id'), nullable=False)
    token = Column(String(2000), nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)
    
    # Relacionamento com o usuário
    user = relationship('User', foreign_keys=[user_id])

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "token": self.token,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
        }
