import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def _get_supabase_credentials() -> tuple[str, str]:
    url = os.getenv("SUPABASE_DB_URL")
    key = os.getenv("SUPABASE_DB_KEY")
    if not url or not key:
        raise EnvironmentError("SUPABASE_DB_URL and SUPABASE_DB_KEY must be set")
    return url, key

def create_supabase_client() -> Client:
    url, key = _get_supabase_credentials()
    return create_client(url, key)

def create_supabase_admin_client() -> Client:
    url = os.getenv("SUPABASE_DB_URL")
    secret_key = os.getenv("SUPABASE_SECRET_KEY")
    if not url or not secret_key:
        raise EnvironmentError("SUPABASE_DB_URL and SUPABASE_SECRET_KEY must be set")
    client = create_client(url, secret_key)
    return client

def create_supabase_client_with_token(token: str) -> Client:
    url, key = _get_supabase_credentials()
    client = create_client(url, key)
    client.postgrest.auth(token)
    client.postgrest.headers["Authorization"] = f"Bearer {token}"
    client.storage._client.headers["Authorization"] = f"Bearer {token}"
    return client