import motor.motor_asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from typing import Optional

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None

db = Database()

async def get_database():
    return db.database

async def connect_to_mongo():
    """Create database connection"""
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DATABASE_NAME", "image_moderation")
    
    db.client = AsyncIOMotorClient(mongodb_url)
    db.database = db.client[db_name]
    
    # Create indexes
    await db.database.tokens.create_index("token", unique=True)
    await db.database.usages.create_index("timestamp")
    await db.database.usages.create_index("token")
    
    print(f"Connected to MongoDB: {db_name}")

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB")