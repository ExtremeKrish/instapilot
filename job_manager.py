# job_manager.py
import utils
import image_gen
import poster
import config
from pathlib import Path
import random
import time

def build_caption(job, quote_text=None):
    cs = job.get("caption_setting", "empty")
    caption = ""
    if cs == "empty":
        caption = ""
    elif cs == "quoteOnly":
        caption = quote_text or ""
    elif cs == "captionFromTxtOnly":
        # job might include caption_file param; fallback to a default file
        cap_file = job.get("caption_file", "general.txt")
        cap = utils.pick_caption(config.CAPTIONS_DIR, cap_file)
        caption = cap or ""
    elif cs == "quoteAndCaptionFromTxt":
        cap_file = job.get("caption_file", "general.txt")
        cap = utils.pick_caption(config.CAPTIONS_DIR, cap_file)
        caption = (quote_text or "")
        if cap:
            caption = caption + "\n\n" + cap
    else:
        caption = ""
    return caption

def run_job(job_id: str):
    # Load job JSON
    print("Running Job: " + job_id)
    
    # job = utils.get_job_json(job_id)

    url = "https://instapilot1-default-rtdb.firebaseio.com/jobs/" + job_id + ".json"
    job = get_json(url)

    
    # Load theme
    # theme = utils.get_theme_json(job["theme"])
    
    url = "https://instapilot1-default-rtdb.firebaseio.com/themes/" + job["theme"] + ".json"
    theme = get_json(url)

    print("Running Job: " + job_id + " with theme: " + job['theme'])

    # Fetch next quote from the job's table (sequential)
    db_table = job["db_table"]
    q = utils.fetch_one_quote_and_mark_used(table_name=db_table)  # <- sequential version in utils
    if not q:
        return {"ok": False, "error": "No more quotes in table"}

    quote_text = q["text"]
    quote_id = q["id"]

    # Build final Instagram caption
    caption = build_caption(job, quote_text=quote_text)

    print("Caption is : " + caption)
    
    # Generate image at static path
    out_dir = config.OUTPUT_DIR / job_id
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "latest.png"

    saved_img = image_gen.generate_image(quote_text, theme, str(out_path))

    return {
        "ok": True,
        "job": job_id,
        "quote_id": quote_id,
        "image_path": saved_img,
        "caption": caption
    }

def get_json(url, params=None, headers=None):
    """
    Sends a GET request to the specified URL and returns the response as JSON.
    
    Args:
        url (str): The URL to request.
        params (dict, optional): Query parameters for the request.
        headers (dict, optional): HTTP headers for the request.
    
    Returns:
        dict: JSON response from the server.
    
    Raises:
        requests.exceptions.RequestException: On network errors.
        ValueError: If the response is not valid JSON.
    """
    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()  # Raises HTTPError if status not 200
    return response.json()
    
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        run_job(sys.argv[1])