from fastapi import APIRouter, Header, HTTPException

from ..db.supabase import create_supabase_client_with_token

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/all")
def get_all_profiles(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    supabase = create_supabase_client_with_token(token)

    response = supabase.table("user_profiles").select("*").execute()
    
    return response.data

@router.get("/{user_id}")
def get_current_user(user_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    supabase = create_supabase_client_with_token(token)

    response = supabase.table("user_profiles").select("*").eq("id", user_id).single().execute()
    user_data = response.data

    if user_data.get("profile_picture"):
        signed = supabase.storage.from_("profile_pictures").create_signed_url(
            user_data["profile_picture"], 3600
        )
        user_data["profile_picture"] = signed.get("signedURL") or user_data["profile_picture"]

    return user_data

@router.put("/update")
def update_profile(user_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    supabase = create_supabase_client_with_token(token)

    # Here you would typically include the logic to update the user's profile
    # For now, we'll just return a success message
    return {"message": "Profile updated successfully"}