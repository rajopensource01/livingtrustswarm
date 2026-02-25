from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from models.database import get_db, init_db, SessionLocal, Agency, Signal
from models.schemas import AgencyResponse

# Initialize app
app = FastAPI(
    title="Living Trust Swarm API",
    description="Risk Assessment System",
    version="1.0.0"
)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup
@app.on_event("startup")
async def startup_event():
    """Initialize database."""
    try:
        init_db()
        db = SessionLocal()
        
        # Create sample agencies if none exist
        if db.query(Agency).count() == 0:
            for i in range(1, 11):
                agency = Agency(
                    name=f"Travel Agency {i}",
                    email=f"agency{i}@example.com",
                    credit_limit=100000.0
                )
                db.add(agency)
            db.commit()
        
        db.close()
        print("✓ Database initialized")
    except Exception as e:
        print(f"Startup error: {e}")

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Get agencies
@app.get("/agencies", response_model=List[AgencyResponse])
async def get_agencies(db: Session = Depends(get_db)):
    """Get all agencies."""
    try:
        agencies = db.query(Agency).all()
        return agencies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
