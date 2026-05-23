import os
import base64
import requests

from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv()

DISCORD_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
GUILD_ID = os.getenv("DISCORD_GUILD_ID")

BASE_URL = "https://discord.com/api/v10"
HEADERS = {
    "Authorization": f"Bot {DISCORD_TOKEN}",
    "Content-Type": "application/json",
}


def post_to_discord(caption: str, media_urls: list[str] = None, scheduled_time: str = None):
    if not DISCORD_TOKEN or not GUILD_ID:
        raise EnvironmentError("DISCORD_BOT_TOKEN and DISCORD_GUILD_ID must be set")

    # Event starts 5 minutes from now (when the scheduler fires)
    # scheduled_time is just when we POST it, not when the event begins
    event_start = datetime.now(timezone.utc) + timedelta(minutes=5)
    start_time = event_start.strftime("%Y-%m-%dT%H:%M:%SZ")
    end_time = (event_start + timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%SZ")

    if scheduled_time:
        start_time = scheduled_time if scheduled_time.endswith("Z") else scheduled_time.replace("+00:00", "Z")
        if not start_time.endswith("Z"):
            start_time += "Z"
    else:
        start_time = (datetime.now(timezone.utc) + timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%SZ")

    start_dt = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
    end_time = (start_dt + timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%SZ")

    event_name = caption.split("\n")[0][:100] if caption else "Scheduled Event"
    description = caption[:1000] if caption else ""

    payload = {
        "name": event_name,
        "description": description,
        "scheduled_start_time": start_time,
        "scheduled_end_time": end_time,
        "privacy_level": 2,
        "entity_type": 3,
        "entity_metadata": {
            "location": "Online",
        },
    }

    # Attach cover image if provided
    if media_urls:
        image_data = _fetch_image_as_base64(media_urls[0])
        if image_data:
            payload["image"] = image_data

    response = requests.post(
        f"{BASE_URL}/guilds/{GUILD_ID}/scheduled-events",
        headers=HEADERS,
        json=payload,
    )

    if response.ok:
        event = response.json()
        print(f"✅ Discord event created: {event['name']} (id: {event['id']})")
        return event["id"]
    else:
        print(f"❌ Discord event creation failed: {response.json()}")
        return None


def _fetch_image_as_base64(image_url: str) -> str | None:
    try:
        response = requests.get(image_url, timeout=10)
        if not response.ok:
            return None
        content_type = response.headers.get("Content-Type", "image/jpeg").split(";")[0]
        encoded = base64.b64encode(response.content).decode("utf-8")
        return f"data:{content_type};base64,{encoded}"
    except Exception as e:
        print(f"⚠️ Failed to fetch image for Discord: {e}")
        return None


# if __name__ == "__main__":
#     post_to_discord(
#         caption="Join us for our upcoming product launch!\nWe'll be showcasing new features live.",
#         scheduled_time="2026-05-10T18:00:00Z",
#     )