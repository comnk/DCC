from instabot import Bot
from dotenv import load_dotenv
import os

load_dotenv()

USERNAME = os.getenv("INSTAGRAM_USERNAME")
PASSWORD = os.getenv("INSTAGRAM_PASSWORD")

def start_instagram_bot():
    bot = Bot()
    bot.login(username=USERNAME, password=PASSWORD)
    return bot

def post_to_instagram(image_path: str, caption: str):
    bot = start_instagram_bot()
    bot.upload_photo(image_path, caption=caption)
    bot.logout()

def post_story_to_instagram(image_path: str, caption: str = ""):
    bot = start_instagram_bot()
    bot.upload_story_photo(image_path, caption=caption)
    bot.logout()
