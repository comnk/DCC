import os

from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

api = os.getenv("SUPABASE_DB_URL")
key = os.getenv("SUPABASE_DB_KEY")

def create_supabase_client() -> Client:
    return create_client(api, key)