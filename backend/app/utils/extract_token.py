import jwt
from fastapi import HTTPException

def extract_token(authorization: str) -> tuple[str, str]:
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return token, user_id