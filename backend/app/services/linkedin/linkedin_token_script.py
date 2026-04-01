import os
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID")
CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")
REDIRECT_URI = os.getenv("LINKEDIN_REDIRECT_URI")

SCOPES = "openid%20profile%20email%20w_member_social%20w_organization_social%20r_organization_social%20rw_organization_admin%20r_organization_admin"

def save_to_env(key, value):
    """Update a key in the .env file."""
    env_path = Path(".env")
    lines = env_path.read_text().splitlines() if env_path.exists() else []
    
    updated = False
    for i, line in enumerate(lines):
        if line.startswith(f"{key}="):
            lines[i] = f"{key}={value}"
            updated = True
            break
    if not updated:
        lines.append(f"{key}={value}")
    
    env_path.write_text("\n".join(lines) + "\n")
    print(f"✅ Saved {key} to .env")


def refresh_access_token():
    """Use the refresh token to get a new access token without browser."""
    refresh_token = os.getenv("LINKEDIN_REFRESH_TOKEN")
    if not refresh_token:
        print("No refresh token found. Run the full OAuth flow.")
        return None

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
    
    if data.get("access_token"):
        print("\n✅ Token refreshed successfully!")
        save_to_env("LINKEDIN_ACCESS_TOKEN", data["access_token"])
        if data.get("refresh_token"):
            save_to_env("LINKEDIN_REFRESH_TOKEN", data["refresh_token"])
        return data["access_token"]
    else:
        print(f"Refresh failed: {data}")
        return None


class CallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        if "code" in params:
            auth_code = params["code"][0]
            print("Got code, exchanging for token immediately...")

            r = requests.post(
                "https://www.linkedin.com/oauth/v2/accessToken",
                data={
                    "grant_type": "authorization_code",
                    "code": auth_code,
                    "redirect_uri": REDIRECT_URI,
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )

            token_data = r.json()
            access_token = token_data.get("access_token")
            refresh_token = token_data.get("refresh_token")

            if access_token:
                print("\n✅ SUCCESS!\n")
                save_to_env("LINKEDIN_ACCESS_TOKEN", access_token)
                if refresh_token:
                    save_to_env("LINKEDIN_REFRESH_TOKEN", refresh_token)
                else:
                    print("⚠️  No refresh token returned (may not be enabled for your app)")

                print(f"\nScopes granted: {token_data.get('scope')}")

                headers = {"Authorization": f"Bearer {access_token}"}
                userinfo = requests.get("https://api.linkedin.com/v2/userinfo", headers=headers).json()
                print(f"Person URN: urn:li:person:{userinfo.get('sub')}")

                orgs = requests.get(
                    "https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR",
                    headers=headers
                ).json()
                print(f"Org Admin Access: {orgs}")

                self.send_response(200)
                self.end_headers()
                self.wfile.write(b"<h2>Done! Check your terminal.</h2>")
            else:
                print(f"Token exchange failed: {token_data}")
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"<h2>Token exchange failed. Check terminal.</h2>")
        else:
            self.send_response(400)
            self.end_headers()

    def log_message(self, format, *args):
        pass


def full_oauth_flow():
    auth_url = (
        f"https://www.linkedin.com/oauth/v2/authorization"
        f"?response_type=code"
        f"&client_id={CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&scope={SCOPES}"
    )
    print("\n👉 Open this URL in your browser:\n")
    print(auth_url)
    print("\nWaiting for callback...\n")

    server = HTTPServer(("0.0.0.0", 8000), CallbackHandler)
    server.handle_request()


if __name__ == "__main__":
    import sys
    if "--refresh" in sys.argv:
        # Run this when your token expires: python linkedin_token_script.py --refresh
        refresh_access_token()
    else:
        full_oauth_flow()