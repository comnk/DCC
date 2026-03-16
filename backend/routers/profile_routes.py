from fastapi import APIRouter, Depends

router = APIRouter(prefix="/profile", tags=["profile"])

@router.put("/update")
def update_profile():
    return {"message": "Profile updated successfully"}