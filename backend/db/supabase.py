import os

from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_DB_URL")
key = os.getenv("SUPABASE_DB_KEY")

def create_supabase_client() -> Client:
    return create_client(url, key)

def create_supabase_client_with_token(token: str) -> Client:
    client = create_client(url, key)
    client.postgrest.auth(token)
    return client