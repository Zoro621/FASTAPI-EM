from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from app.routers import auth, moderation
from app.services.database import connect_to_mongo, close_mongo_connection

load_dotenv()

app = FastAPI(
    title="Image Moderation API",
    description="AI-powered image content moderation service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database events
app.add_event_handler("startup", connect_to_mongo)
app.add_event_handler("shutdown", close_mongo_connection)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(moderation.router, tags=["Moderation"])

@app.get("/")
async def root():
    return {"message": "Image Moderation API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}