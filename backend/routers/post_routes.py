from fastapi import APIRouter, Header
from models.post import Post

router = APIRouter(prefix="/posts", tags=["posts"])

@router.post("/create")
def create_post(post: Post, authorization: str = Header(...)):
    return {"message": "Post created successfully"}