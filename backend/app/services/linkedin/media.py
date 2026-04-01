import os
import httpx
import requests

from dotenv import load_dotenv

load_dotenv()

AUTHOR_URN = os.getenv("LINKEDIN_ORG_URN")

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


def upload_video_to_linkedin(video_url, access_token):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202602"
    }
    
    video_data = requests.get(video_url).content
    print(f"Video size: {len(video_data)} bytes")

    initialize_payload = {
        "initializeUploadRequest": {
            "owner": AUTHOR_URN,
            "fileSizeBytes": len(video_data),
            "uploadCaptions": False,
            "uploadThumbnail": False
        }
    }
    
    initialize_response = requests.post(
        "https://api.linkedin.com/rest/videos?action=initializeUpload",
        headers=headers,
        json=initialize_payload
    )
    initialize_data = initialize_response.json()

    upload_instructions = initialize_data["value"]["uploadInstructions"]
    asset_urn = initialize_data["value"]["video"]
    upload_token = initialize_data["value"]["uploadToken"]

    etags = []
    with httpx.Client(http2=True, follow_redirects=True) as client:
        for i, instruction in enumerate(upload_instructions):
            chunk_url = instruction["uploadUrl"]
            first_byte = instruction["firstByte"]
            last_byte = instruction["lastByte"]
            chunk = video_data[first_byte:last_byte + 1]

            print(f"Uploading part {i+1}/{len(upload_instructions)} ({len(chunk)} bytes)...")
            put_response = client.put(
                chunk_url,
                content=chunk,
                headers={
                    "Content-Type": "application/octet-stream",
                    "Content-Length": str(len(chunk))
                }
            )
            print(f"Part {i+1} status: {put_response.status_code}")

            if put_response.status_code not in (200, 201):
                raise Exception(f"Chunk {i+1} upload failed: {put_response.status_code} {put_response.text[:200]}")

            etag = put_response.headers.get("ETag", "").strip('"')
            etags.append(etag)

    print(f"All parts uploaded. ETags: {etags}")

    finalize_payload = {
        "finalizeUploadRequest": {
            "video": asset_urn,
            "uploadToken": upload_token,
            "uploadedPartIds": etags
        }
    }
    finalize_response = requests.post(
        "https://api.linkedin.com/rest/videos?action=finalizeUpload",
        headers=headers,
        json=finalize_payload
    )
    print(f"Finalize status: {finalize_response.status_code}")
    print(f"Finalize response: {finalize_response.text}")

    if not finalize_response.ok:
        raise Exception(f"Finalize failed: {finalize_response.json()}")

    print(f"Video uploaded! Asset URN: {asset_urn}")
    return asset_urn