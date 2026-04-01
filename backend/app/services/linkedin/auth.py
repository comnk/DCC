import os
import requests

from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID")
CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")

def refresh_access_token():
    """Silently refresh the access token using the refresh token."""
    refresh_token = os.getenv("LINKEDIN_REFRESH_TOKEN")
    if not refresh_token:
        raise Exception("No refresh token found. Run linkedin_auth.py to re-authenticate.")

    r = requests.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    data = r.json()
    new_token = data.get("access_token")
    if not new_token:
        raise Exception(f"Token refresh failed: {data}")

    env_path = Path(".env")
    lines = env_path.read_text().splitlines()
    for i, line in enumerate(lines):
        if line.startswith("LINKEDIN_ACCESS_TOKEN="):
            lines[i] = f"LINKEDIN_ACCESS_TOKEN={new_token}"
            break
    env_path.write_text("\n".join(lines) + "\n")

    print("🔄 Token refreshed automatically.")
    return new_token