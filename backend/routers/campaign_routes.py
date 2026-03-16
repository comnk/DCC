from fastapi import APIRouter, Depends

router = APIRouter(prefix="/campaign", tags=["campaign"])

@router.post("/create")
def create_campaign():
    return {"message": "Campaign created successfully"}