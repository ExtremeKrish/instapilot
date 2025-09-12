# job_manager.py
import utils
import image_gen
import poster
import config
from pathlib import Path
import random
import time
import requests
import os

def build_caption(job, quote_text=None):
    cs = job.get("caption_settings", "empty")
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
    testingMode = False
    
    utils.log_message(f"-----------------------------------")

    utils.log_message(f"➡️ Starting a Job with ID: {job_id}")

    # Load job JSON
    #job = get_json(url)
    
    job = utils.fetch_job_by_slug(job_id)
    # job = utils.get_job_json(job_id)

    access_token = job['access_token']
    
    if job["status"] == "testing":
        testingMode = True

    # Load theme

    #theme = get_json(url)
    
    if job['type'] == 'url':
        caption = build_caption(job)
        
        x = job['count'] + 1
        quote_id = x
        image_url = job['url'].format(x=x)
        utils.log_message(f"🟩 Uploading Image Number: {quote_id}")
        if not testingMode:
            utils.log_message(utils.increment_job_count(job_id))


    if job["type"] == "generate":
        theme = utils.get_theme_json(job["theme"])
        db_table = job["db_table"]
        q = utils.fetch_one_quote_and_mark_used(table_name=db_table, testingMode=testingMode)
        if not q:
            return {"ok": False, "error": "No more quotes in table"}
            utils.log_message(f"⚠️ No more quotes in table")


        quote_text = q["text"]

        quote_id = q["id"]

        caption = build_caption(job, quote_text=quote_text)

        out_dir = config.OUTPUT_DIR / job_id
        out_dir.mkdir(parents=True, exist_ok=True)
        filename = f"{int(time.time() * 1000)}.png"
        out_path = out_dir / filename
        image_url = f"https://instapilot.onrender.com/output/{job_id}/{filename}"

        utils.log_message(f"🟩 All set... Generating Image...")

        # Generate image
        saved_img = image_gen.generate_image(quote_text, theme, str(out_path))

        utils.log_message(f"🟩 Image Generated... Now Uploading...")
   
    ig_account_id = job["account"]
    

    try:
        result = poster.upload_to_instagram(
            caption=caption,
            ig_account_id=ig_account_id,
            image_url=image_url,
            access_token=access_token
        )
        print("Instagram upload result:", result)
        
        if job["type"] == "generate":
            utils.log_message(f"✅ Image Uploaded with Quote ID: {quote_id} & Job : {job_id}")
            
        if job["type"] == "url":
            utils.log_message(f"✅ Image Uploaded with Count ID: {quote_id} & Job : {job_id}")

    except NotImplementedError:
        print("Upload function not implemented yet (needs public image URL).")
        result = None
        
        if job["type"] == "generate":
            utils.mark_quote_unused(table_name=db_table, quote_id=quote_id)

    except Exception as e:
        print("Error uploading to Instagram:", e)
        utils.log_message(f"🚨 Error uploading Quote ID: {quote_id} to Instagram: {e}")
        
        if job["type"] == "generate":
            utils.mark_quote_unused(table_name=db_table, quote_id=quote_id)
            
        if job["type"] == "url" and not testingMode:
            utils.decrement_job_count(job_id)

        result = None
    finally:
        # Delete the generated image after upload attempt
        if job["type"] == "generate":
            try:
                if out_path.exists():
                    os.remove(out_path)
                    print(f"Deleted temp image: {out_path}")
            except Exception as e:
                print("Error deleting image:", e)
                utils.log_message(f"🚨 Error deleting image: {e}")
                

    return {
        "ok": True,
        "job": job_id,
        "quote_id": quote_id,
        "upload_result": result,
        "testingMode": testingMode
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