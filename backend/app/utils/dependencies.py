from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.services.database import get_database
from app.services.auth_service import AuthService
from app.models.token import Token

security = HTTPBearer()

async def get_auth_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> AuthService:
    return AuthService(db)

async def get_current_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
) -> Token:
    """Validate bearer token"""
    token = await auth_service.verify_token(credentials.credentials)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return token

async def get_admin_token(
    current_token: Token = Depends(get_current_token)
) -> Token:
    """Ensure token has admin privileges"""
    if not current_token.isAdmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_token