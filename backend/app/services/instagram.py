import os
import logging

from pathlib import Path
from dotenv import load_dotenv
from instagrapi import Client
from instagrapi.exceptions import LoginRequired, ChallengeRequired, SelectContactPointRecoveryForm, RecaptchaChallengeForm
from instagrapi.types import StoryMention, StoryMedia, StoryLink, StoryHashtag

load_dotenv()

ACCOUNT_USERNAME = os.getenv("INSTAGRAM_USERNAME")
ACCOUNT_PASSWORD = os.getenv("INSTAGRAM_PASSWORD")
SESSION_FILE = Path("instagram_session.json")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def challenge_code_handler(username, choice):
    """Called by instagrapi automatically when a challenge code is needed."""
    print(f"\n📲 Instagram sent a verification code to your {'email' if choice == 1 else 'phone'}.")
    return input("Enter the code here: ").strip()

def login_user() -> Client:
    cl = Client()
    cl.set_locale("en_US")
    cl.set_timezone_offset(-25200)
    cl.set_device({
        "app_version": "269.0.0.18.75",
        "android_version": 26,
        "android_release": "8.0.0",
        "dpi": "480dpi",
        "resolution": "1080x1920",
        "manufacturer": "OnePlus",
        "device": "ONEPLUS A3010",
        "model": "OnePlus3T",
        "cpu": "qcom",
        "version_code": "314665256",
    })
    cl.set_user_agent()
    cl.delay_range = [1, 3]

    cl.challenge_code_handler = challenge_code_handler

    if SESSION_FILE.exists():
        try:
            cl.load_settings(SESSION_FILE)
            cl.login(ACCOUNT_USERNAME, ACCOUNT_PASSWORD)
            cl.get_timeline_feed()
            logger.info("✅ Logged in via saved session.")
            return cl
        except LoginRequired:
            logger.info("⚠️  Session expired, falling back to password login.")
            old_uuids = cl.get_settings()["uuids"]
            cl.set_settings({})
            cl.set_uuids(old_uuids)
        except Exception as e:
            logger.warning("Couldn't login via session: %s", e)

    try:
        logger.info("Attempting password login for: %s", ACCOUNT_USERNAME)
        cl.login(ACCOUNT_USERNAME, ACCOUNT_PASSWORD)
        cl.dump_settings(SESSION_FILE)
        logger.info("✅ Logged in via password. Session saved.")
        return cl
    except (SelectContactPointRecoveryForm, RecaptchaChallengeForm) as e:
        logger.error("❌ Challenge type not supported automatically: %s", e)
        logger.error("Try logging in manually via the Instagram app first, then re-run.")
    except Exception as e:
        logger.error("Couldn't login via password: %s", e)

    raise Exception("❌ All login attempts failed.")

cl = login_user()
cl.logout()

# media_pk = cl.media_pk_from_url('https://www.instagram.com/p/CGgDsi7JQdS/')
# media_path = cl.video_download(media_pk)
# example = cl.user_info_by_username('example')
# hashtag = cl.hashtag_info('dhbastards')

# cl.video_upload_to_story(
#     media_path,
#     "Credits @example",
#     mentions=[StoryMention(user=example, x=0.49892962, y=0.703125, width=0.8333333333333334, height=0.125)],
#     links=[StoryLink(webUri='https://github.com/subzeroid/instagrapi')],
#     hashtags=[StoryHashtag(hashtag=hashtag, x=0.23, y=0.32, width=0.5, height=0.22)],
#     medias=[StoryMedia(media_pk=media_pk, x=0.5, y=0.5, width=0.6, height=0.8)]
# )