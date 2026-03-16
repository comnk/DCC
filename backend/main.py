from fastapi import FastAPI
from db.supabase import create_supabase_client
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_routes, profile_routes, campaign_routes

app = FastAPI()
supabase = create_supabase_client()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(campaign_routes.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}