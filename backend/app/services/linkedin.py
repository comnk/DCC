import os
import requests
import json
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID")
CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")
AUTHOR_URN = os.getenv("LINKEDIN_ORG_URN")

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


def post_to_linkedin(post_text):
    access_token = os.getenv("LINKEDIN_ACCESS_TOKEN")

    api_url = "https://api.linkedin.com/v2/ugcPosts"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
    }
    post_data = {
        "author": AUTHOR_URN,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": post_text},
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }

    response = requests.post(api_url, headers=headers, data=json.dumps(post_data))

    if response.status_code == 401:
        print("Token expired, refreshing...")
        access_token = refresh_access_token()
        headers["Authorization"] = f"Bearer {access_token}"
        response = requests.post(api_url, headers=headers, data=json.dumps(post_data))

    if response.ok:
        print("✅ Post successful!")
    else:
        print(f"❌ Failed: {response.json()}")

post_to_linkedin("Exciting news from our company! This is a test post for the gram #LinkedInAPI #Automation")