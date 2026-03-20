from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from ..db.supabase import create_supabase_client

router = APIRouter(prefix="/users", tags=["users"])
supa = create_supabase_client()

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    res = supa.auth.sign_in_with_password({"email":form_data.username, "password": form_data.password})
    return res.get("access_token")

@router.post("/signup")
def signup(form_data: OAuth2PasswordRequestForm = Depends()):
    res = supa.auth.sign_up({"email":form_data.username, "password": form_data.password})
    return res.get("access_token")