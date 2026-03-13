from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models import User, Task
from routers import tasks, interviews, activity, chat
import datetime

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Salarite Virtual HR ATS")

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router)
app.include_router(interviews.router)
app.include_router(activity.router)
app.include_router(chat.router)

# Seed initial data
def seed_data():
    db = SessionLocal()
    if db.query(User).count() == 0:
        employer = User(name="John (Employer)", email="employer@salarite.com", password="admin", role="employer")
        hr1 = User(name="Virtual HR 1", email="hr1@salarite.com", password="hr", role="hr")
        hr2 = User(name="Virtual HR 2", email="hr2@salarite.com", password="hr", role="hr")
        db.add(employer)
        db.add(hr1)
        db.add(hr2)
        db.commit()

        # Seed realistic HR tasks
        sample_tasks = [
            Task(
                title="Screen React Developer Resumes",
                description="Review 15 applications for the React Developer position. Filter based on 2+ years React experience, TypeScript proficiency, and portfolio quality. Shortlist top 5 candidates.",
                priority="High",
                status="Pending",
                assigned_to=2,
                created_at=datetime.datetime.utcnow()
            ),
            Task(
                title="Schedule Technical Interviews (Backend)",
                description="Coordinate with shortlisted Python/FastAPI candidates. Set up 30-min technical screening calls. Check availability and send calendar invites.",
                priority="High",
                status="Pending",
                assigned_to=2,
                created_at=datetime.datetime.utcnow()
            ),
            Task(
                title="Update Job Descriptions on Portal",
                description="Revise JD for 'Senior UI/UX Designer' and 'DevOps Engineer' roles. Ensure salary range, skills required, and benefits are accurate and up to date.",
                priority="Medium",
                status="Pending",
                assigned_to=2,
                created_at=datetime.datetime.utcnow()
            ),
            Task(
                title="Onboarding Documents Preparation",
                description="Prepare welcome kit, offer letter templates, and NDA for 3 new hires joining next Monday. Coordinate with legal for compliance check.",
                priority="Medium",
                status="Pending",
                assigned_to=3,
                created_at=datetime.datetime.utcnow()
            ),
            Task(
                title="Candidate Background Verification",
                description="Run background checks for 2 finalized candidates — Rahul Sharma (React Dev) and Priya Singh (QA Engineer). Verify education, previous employment, and references.",
                priority="Low",
                status="Pending",
                assigned_to=3,
                created_at=datetime.datetime.utcnow()
            ),
        ]
        db.add_all(sample_tasks)
        db.commit()
    db.close()

seed_data()

@app.get("/")
def read_root():
    return {"message": "Welcome to Salarite Virtual HR ATS Backend"}
