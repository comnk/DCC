from fastapi import FastAPI
from db.supabase import create_supabase_client
from schemas.user import User
from routers import auth_routes, profile_routes

app = FastAPI()

supabase = create_supabase_client()

app.include_router(auth_routes.router)
app.include_router(profile_routes.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}