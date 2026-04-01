import os
import time
import requests

from dotenv import load_dotenv

load_dotenv()

ACCOUNT_ID = os.getenv("INSTAGRAM_ACCOUNT_ID")
ACCESS_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN")

BASE_URL = "https://graph.instagram.com/v23.0"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {ACCESS_TOKEN}"
}

def create_photo_container(photo_url, caption="Test photo upload via Instagram Graph API"):
    url = f"{BASE_URL}/{ACCOUNT_ID}/media"
    payload = {
        "image_url": photo_url,
        "caption": caption
    }
    response = requests.post(url, json=payload, headers=HEADERS)
    data = response.json()

    if "id" in data:
        print(f"Photo container created! creation_id: {data['id']}")
        return data["id"]
    else:
        print(f"Error creating photo container: {data}")
        return None

def create_carousel_container(media_urls):
    url = f"{BASE_URL}/{ACCOUNT_ID}/media"
    children = []
    
    if (len(media_urls) < 2 or len(media_urls) > 10):
        print("Carousel must have between 2 and 10 media items.")
        return None
    
    for media_url in media_urls:
        if (media_url.endswith(".mp4") or media_url.endswith(".mov")):
            children.append({"video_url": media_url})
        else:
            children.append({"image_url": media_url})
    
    payload = {
        "media_type": "CAROUSEL",
        "children": children,
        "caption": "Test carousel upload via Instagram Graph API"
    }
    response = requests.post(url, json=payload, headers=HEADERS)
    data = response.json()

    if "id" in data:
        print(f"Carousel container created! creation_id: {data['id']}")
        return data["id"]
    else:
        print(f"Error creating carousel container: {data}")
        return None

def create_video_container(media_url="https://res.cloudinary.com/dlzor5lap/video/upload/v1758201802/b4xfa8yel6chwqx7ou6j.mp4", caption="Test video upload via Instagram Graph API"):
    url = f"{BASE_URL}/{ACCOUNT_ID}/media"
    payload = {
        "video_url": media_url,
        "caption": caption,
        "media_type": "VIDEO"
    }
    response = requests.post(url, json=payload, headers=HEADERS)
    data = response.json()

    if "id" in data:
        print(f"Video container created! creation_id: {data['id']}")
        return data["id"]
    else:
        print(f"Error creating video container: {data}")
        return None

def create_reels_container(video_url="https://res.cloudinary.com/dlzor5lap/video/upload/v1758201802/b4xfa8yel6chwqx7ou6j.mp4", caption="Test reels upload via Instagram Graph API"):
    url = f"{BASE_URL}/{ACCOUNT_ID}/media"
    payload = {
        "video_url": video_url,
        "caption": caption,
        "media_type": "REELS"
    }
    response = requests.post(url, json=payload, headers=HEADERS)
    data = response.json()

    if "id" in data:
        print(f"Container created! creation_id: {data['id']}")
        return data["id"]
    else:
        print(f"Error creating container: {data}")
        return None

def create_stories_container(media_url, media_type="IMAGE", user_tags=None):
    url = f"{BASE_URL}/{ACCOUNT_ID}/media"
    
    if media_type == "VIDEO":
        payload = {
            "video_url": media_url,
            "user_tags": user_tags,
            "media_type": "STORIES"
        }
    else:
        payload = {
            "image_url": media_url,
            "user_tags": user_tags,
            "media_type": "STORIES"
        }
        
    response = requests.post(url, json=payload, headers=HEADERS)
    data = response.json()

    if "id" in data:
        print(f"Container created! creation_id: {data['id']}")
        return data["id"]
    else:
        print(f"Error creating container: {data}")
        return None

def wait_until_ready(creation_id, max_wait=300, interval=10):
    """Poll the container status until it's FINISHED or we time out."""
    url = f"{BASE_URL}/{creation_id}"
    params = {
        "fields": "status_code,status",
        "access_token": ACCESS_TOKEN
    }

    elapsed = 0
    while elapsed < max_wait:
        response = requests.get(url, params=params)
        data = response.json()
        status = data.get("status_code")
        print(f"Container status: {status} (waited {elapsed}s)")

        if status == "FINISHED":
            return True
        elif status == "ERROR":
            print(f"Container processing failed: {data}")
            return False

        time.sleep(interval)
        elapsed += interval

    print("Timed out waiting for container to be ready.")
    return False

def publish_container(creation_id):
    url = f"{BASE_URL}/{ACCOUNT_ID}/media_publish"
    payload = {
        "creation_id": creation_id
    }
    response = requests.post(url, json=payload, headers=HEADERS)
    data = response.json()

    if "id" in data:
        print(f"Published successfully! Post ID: {data['id']}")
        return data["id"]
    else:
        print(f"Error publishing: {data}")
        return None

# creation_video_id = create_video_container()
# if creation_video_id:
#     print("Waiting for video to be processed...")
#     if wait_until_ready(creation_video_id):
#         publish_container(creation_video_id)

photo_url = "https://image2url.com/r2/default/images/1774978157264-1a3f586a-f907-4560-afbb-dbf608f13ae7.jpg"
creation_photo_id = create_stories_container(photo_url)
if creation_photo_id:
    print("Waiting for photo to be processed...")
    if wait_until_ready(creation_photo_id):
        publish_container(creation_photo_id)