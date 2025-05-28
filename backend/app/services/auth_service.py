import secrets
import string
from datetime import datetime
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.token import Token, TokenCreate, TokenResponse
from app.models.usage import Usage

class AuthService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database
        self.tokens_collection = database.tokens
        self.usages_collection = database.usages

    def generate_token(self, length: int = 32) -> str:
        """Generate a secure random token"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(length))

    async def create_token(self, token_data: TokenCreate) -> TokenResponse:
        """Create a new bearer token"""
        token_string = self.generate_token()
        
        token = Token(
            token=token_string,
            isAdmin=token_data.isAdmin,
            description=token_data.description
        )
        
        await self.tokens_collection.insert_one(token.dict())
        
        return TokenResponse(**token.dict())

    async def get_token(self, token: str) -> Optional[Token]:
        """Get token by token string"""
        token_doc = await self.tokens_collection.find_one({"token": token, "isActive": True})
        if token_doc:
            return Token(**token_doc)
        return None

    async def get_all_tokens(self) -> List[TokenResponse]:
        """Get all active tokens"""
        tokens = []
        async for token_doc in self.tokens_collection.find({"isActive": True}):
            tokens.append(TokenResponse(**token_doc))
        return tokens

    async def delete_token(self, token: str) -> bool:
        """Soft delete a token"""
        result = await self.tokens_collection.update_one(
            {"token": token},
            {"$set": {"isActive": False}}
        )
        return result.modified_count > 0

    async def log_usage(self, usage: Usage):
        """Log API usage"""
        await self.usages_collection.insert_one(usage.dict())

    async def verify_token(self, token: str) -> Optional[Token]:
        """Verify if token is valid and active"""
        return await self.get_token(token)