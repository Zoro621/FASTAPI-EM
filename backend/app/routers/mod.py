from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from typing import Dict, Any

from app.services.moderation_service import ImageModerationService
from app.services.auth_service import AuthService
from app.utils.dependencies import get_current_token, get_auth_service
from app.models.token import Token
from app.models.usage import Usage

router = APIRouter()
moderation_service = ImageModerationService()

@router.post("/moderate")
async def moderate_image(
    file: UploadFile = File(...),
    current_token: Token = Depends(get_current_token),
    auth_service: AuthService = Depends(get_auth_service)
) -> Dict[str, Any]:
    """Analyze uploaded image for harmful content"""
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Check file size (limit to 10MB)
    max_size = 10 * 1024 * 1024  # 10MB
    file_content = await file.read()
    if len(file_content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 10MB"
        )
    
    try:
        # Moderate the image
        result = await moderation_service.moderate_image(file_content)
        
        # Log usage
        usage = Usage(
            token=current_token.token,
            endpoint="/moderate",
            method="POST",
            status_code=200,
            metadata={
                "filename": file.filename,
                "file_size": len(file_content),
                "content_type": file.content_type,
                "is_safe": result["is_safe"]
            }
        )
        await auth_service.log_usage(usage)
        
        return result
        
    except Exception as e:
        # Log error usage
        usage = Usage(
            token=current_token.token,
            endpoint="/moderate",
            method="POST",
            status_code=500,
            metadata={
                "filename": file.filename,
                "error": str(e)
            }
        )
        await auth_service.log_usage(usage)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process image"
        )
