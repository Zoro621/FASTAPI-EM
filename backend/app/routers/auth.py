from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.models.token import TokenCreate, TokenResponse
from app.services.auth_service import AuthService
from app.utils.dependencies import get_auth_service, get_admin_token
from app.models.token import Token

router = APIRouter()

@router.post("/tokens", response_model=TokenResponse)
async def create_token(
    token_data: TokenCreate,
    auth_service: AuthService = Depends(get_auth_service),
    admin_token: Token = Depends(get_admin_token)
):
    """Create a new bearer token (Admin only)"""
    return await auth_service.create_token(token_data)

@router.get("/tokens", response_model=List[TokenResponse])
async def get_tokens(
    auth_service: AuthService = Depends(get_auth_service),
    admin_token: Token = Depends(get_admin_token)
):
    """Get all active tokens (Admin only)"""
    return await auth_service.get_all_tokens()

@router.delete("/tokens/{token}")
async def delete_token(
    token: str,
    auth_service: AuthService = Depends(get_auth_service),
    admin_token: Token = Depends(get_admin_token)
):
    """Delete a token (Admin only)"""
    success = await auth_service.delete_token(token)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found"
        )
    return {"message": "Token deleted successfully"}