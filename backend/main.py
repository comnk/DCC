from fastapi import FastAPI
from db.supabase import create_supabase_client
from schemas.user import User
from routers import users

app = FastAPI()

supabase = create_supabase_client()

app.include_router(users.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}