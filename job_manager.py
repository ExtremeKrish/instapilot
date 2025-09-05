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
    job = utils.get_job_json(job_id)

    # Load theme
    theme = utils.get_theme_json(job["theme"])

    # Fetch next quote from the job's table (sequential)
    db_table = job["db_table"]
    q = utils.fetch_one_quote_and_mark_used(table_name=db_table)  # <- sequential version in utils
    if not q:
        return {"ok": False, "error": "No more quotes in table"}

    quote_text = q["text"]
    quote_id = q["id"]

    # Build final Instagram caption
    caption = build_caption(job, quote_text=quote_text)

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
