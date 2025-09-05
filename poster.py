# poster.py
import requests
import config
import time
import utils

def upload_to_instagram(caption: str, ig_account_id: str, job_id: str):
    """
    Returns dict with result or raises exception.
    Requires IG_ACCESS_TOKEN set in env.
    Instagram Graph API flow:
      1) POST /{ig-user-id}/media?image_url=...&caption=...&access_token=...
      2) POST /{ig-user-id}/media_publish?creation_id={container_id}
    NOTE: For image_url you can either host the file publicly or try uploading via Facebook Graph if supported.
    Here we assume the server can host the image at a public URL OR Instagram supports uploading via binary (not in this simple code).
    Simpler approach: if using a server with public URL, pass that image_url.
    """
    token = config.IG_ACCESS_TOKEN
    if not token:
        raise RuntimeError("IG_ACCESS_TOKEN not configured in env")

    # Step 0: we assume you have a publicly reachable URL for the image.
    # If not, you must upload the file somewhere first (S3 / your public server).
    # For now: naive approach — try to use a local public server pattern: not implemented.
    # So we require that user uploads the file to a public URL or adjust this function to upload to S3.
    # raise NotImplementedError("upload_to_instagram requires a public image URL. Implement hosting (S3) or modify poster.py to upload binary to FB Graph before create container.")

    # Example (if you had image_url):
    # https://instapilot.onrender.com/output/job1/latest.png
    image_url = "https://instapilot.onrender.com/output/" + job_id + "/latest.png"
    base = f"https://graph.facebook.com/{config.IG_API_VERSION}/{ig_account_id}"
    create_media = f"{base}/media"
    payload = {
        "image_url": image_url,
        "caption": caption,
        "access_token": token
    }
    r = requests.post(create_media, data=payload)
    r.raise_for_status()
    container_id = r.json().get("id")

    publish_url = f"{base}/media_publish"
    r2 = requests.post(publish_url, data={"creation_id": container_id, "access_token": token})
    r2.raise_for_status()
    return r2.json()

# At the bottom of poster.py

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Upload an image to Instagram.")
    parser.add_argument("--caption", required=True, help="Caption text for the post")
    parser.add_argument("--ig_account_id", required=True, help="Instagram Business Account ID")
    parser.add_argument("--job_id", required=True, help="Job identifier (used to build image URL)")

    args = parser.parse_args()

    try:
        result = upload_to_instagram(
            caption=args.caption,
            ig_account_id=args.ig_account_id,
            job_id=args.job_id
        )
        print("Upload result:", result)
    except NotImplementedError as e:
        print("Function not fully implemented:", e)
    except Exception as e:
        print("Error:", e)
