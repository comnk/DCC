import jwt

from fastapi import APIRouter, Header, Body

from ..db.supabase import create_supabase_client_with_token

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}")
async def get_user(user_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    user_id = payload.get("sub")

    supabase = create_supabase_client_with_token(token)

    auth_response = supabase.auth.get_user(token)
    email = auth_response.user.email if auth_response.user else None

    profile_response = supabase.table("user_profiles").select("*").eq("id", user_id).execute()

    if not profile_response.data:
        return {"error": "User not found"}

    return {**profile_response.data[0], "email": email}


@router.put("/update-profile")
async def update_profile(
    profile_data: dict = Body(...),
    authorization: str = Header(...)
):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    user_id = payload.get("sub")

    supabase = create_supabase_client_with_token(token)

    email = profile_data.pop("email", None)
    password = profile_data.pop("password", None)

    if email or password:
        auth_update = {}
        if email:
            auth_update["email"] = email
        if password:
            auth_update["password"] = password
        supabase.auth.update_user(auth_update)

    if profile_data:
        response = supabase.table("user_profiles").update(profile_data).eq("id", user_id).execute()
        if not response.data:
            return {"error": "Failed to update profile"}

    return {"message": "Profile updated successfully"}