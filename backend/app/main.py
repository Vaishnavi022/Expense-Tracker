from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.database.database import create_tables
from app.routes import auth, expenses, analytics

# Import models so SQLAlchemy picks them up before create_all
from app.models import user, expense  # noqa: F401

app = FastAPI(
    title="Expense Tracker API",
    description="Production-ready REST API for personal expense management",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_tables()


app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(analytics.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Expense Tracker API is running"}