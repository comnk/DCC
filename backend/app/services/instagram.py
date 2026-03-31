import os

from dotenv import load_dotenv
from instagrapi import Client

load_dotenv()

ACCOUNT_USERNAME = os.getenv("INSTAGRAM_USERNAME")
ACCOUNT_PASSWORD = os.getenv("INSTAGRAM_PASSWORD")

cl = Client()

cl.login(ACCOUNT_USERNAME, ACCOUNT_PASSWORD)

user_id = cl.user_id_from_username(ACCOUNT_USERNAME)
medias = cl.user_medias(user_id, 20)