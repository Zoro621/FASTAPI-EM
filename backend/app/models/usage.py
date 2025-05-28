from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any

class Usage(BaseModel):
    token: str = Field(..., description="Bearer token used")
    endpoint: str = Field(..., description="API endpoint accessed")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    method: str = Field(..., description="HTTP method")
    status_code: Optional[int] = Field(None, description="Response status code")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class UsageStats(BaseModel):
    total_requests: int
    requests_by_endpoint: Dict[str, int]
    requests_by_day: Dict[str, int]
    most_active_tokens: Dict[str, int]
