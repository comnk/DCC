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

def upload_image_to_linkedin(image_url, access_token):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202602"
    }

    initialize_url = "https://api.linkedin.com/rest/images?action=initializeUpload"
    initialize_payload = {
        "initializeUploadRequest": {
            "owner": AUTHOR_URN
        }
    }

    initialize_response = requests.post(initialize_url, headers=headers, json=initialize_payload)
    initialize_data = initialize_response.json()
    print(f"Initialize response: {initialize_data}")

    upload_url = initialize_data["value"]["uploadUrl"]
    asset_urn = initialize_data["value"]["image"]

    image_data = requests.get(image_url).content
    put_response = requests.put(
        upload_url,
        data=image_data,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/octet-stream"
        }
    )
    print(f"Upload status: {put_response.status_code}")

    print(f"Image uploaded! Asset URN: {asset_urn}")
    return asset_urn
    
def post_to_linkedin(post_text, image_url=None):
    access_token = os.getenv("LINKEDIN_ACCESS_TOKEN")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202602"
    }

    if image_url:
        asset_urn = upload_image_to_linkedin(image_url, access_token)
        post_data = {
            "author": AUTHOR_URN,
            "lifecycleState": "PUBLISHED",
            "visibility": "PUBLIC",
            "commentary": post_text,
            "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": []
            },
            "content": {
                "media": {
                    "altText": "Image",
                    "id": asset_urn
                }
            }
        }
    else:
        post_data = {
            "author": AUTHOR_URN,
            "lifecycleState": "PUBLISHED",
            "visibility": "PUBLIC",
            "commentary": post_text,
            "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": []
            }
        }

    response = requests.post(
        "https://api.linkedin.com/rest/posts",
        headers=headers,
        json=post_data
    )

    if response.status_code == 401:
        print("Token expired, refreshing...")
        access_token = refresh_access_token()
        headers["Authorization"] = f"Bearer {access_token}"
        response = requests.post("https://api.linkedin.com/rest/posts", headers=headers, json=post_data)

    if response.ok:
        print("✅ Post successful!")
    else:
        print(f"❌ Failed: {response.json()}")

test_text = "Exciting news from our company! This is a test post for the gram #LinkedInAPI #Automation"
test_image_url = "https://image2url.com/r2/default/images/1774978157264-1a3f586a-f907-4560-afbb-dbf608f13ae7.jpg"
post_to_linkedin(test_text, test_image_url)