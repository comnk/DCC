import os
import requests

from dotenv import load_dotenv
from .media import upload_image_to_linkedin, upload_video_to_linkedin
from .auth import refresh_access_token

load_dotenv()

CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID")
CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")
AUTHOR_URN = os.getenv("LINKEDIN_ORG_URN")

def post_to_linkedin(post_text, image_url=None, video_url=None):
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
    elif video_url:
        asset_urn = upload_video_to_linkedin(video_url, access_token)
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
                    "title": "Video",
                    "id": asset_urn
                }
            },
            "isReshareDisabledByAuthor": False
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
# test_image_url = "https://image2url.com/r2/default/images/1774978157264-1a3f586a-f907-4560-afbb-dbf608f13ae7.jpg"
test_video_url = "https://res.cloudinary.com/dlzor5lap/video/upload/v1758201802/b4xfa8yel6chwqx7ou6j.mp4"
post_to_linkedin(test_text, image_url=None, video_url=test_video_url)