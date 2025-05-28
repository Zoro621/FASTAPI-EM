from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class Token(BaseModel):
    token: str = Field(..., description="Bearer token string")
    isAdmin: bool = Field(default=False, description="Admin privileges flag")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    isActive: bool = Field(default=True, description="Token active status")
    description: Optional[str] = Field(None, description="Token description")

class TokenCreate(BaseModel):
    isAdmin: bool = Field(default=False)
    description: Optional[str] = None

class TokenResponse(BaseModel):
    token: str
    isAdmin: bool
    createdAt: datetime
    isActive: bool
    description: Optional[str] = None
