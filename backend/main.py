from fastapi import FastAPI
from db.supabase import create_supabase_client
from models.models import User

app = FastAPI()

supabase = create_supabase_client()

@app.get("/")
async def root():
    return {"message": "Hello World"}