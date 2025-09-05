# utils.py
import json
import random
import os
from pathlib import Path
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional
import config


# ---------- JSON Helpers ----------
def load_json_file(path: Path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json_file(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# ---------- Caption Helpers ----------
def list_caption_lines(file_path: Path):
    if not file_path.exists():
        return []
    with open(file_path, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]
    return lines


def pick_caption(captions_dir: Path, caption_file_name: str) -> Optional[str]:
    f = captions_dir / caption_file_name
    if not f.exists():
        return None
    lines = list_caption_lines(f)
    if not lines:
        return None
    return random.choice(lines)


# ---------- Postgres (Neon) Helpers ----------
def get_pg_conn():
    url = config.NEON_DATABASE_URL
    if not url:
        raise RuntimeError("NEON_DATABASE_URL not set in env")
    conn = psycopg2.connect(url)
    return conn


def fetch_one_quote_and_mark_used(table_name="quotes", testingMode=False):
    """
    Fetch the next unused quote in sequence (lowest id first),
    optionally mark it as used unless testingMode is True.
    """
    conn = get_pg_conn()
    try:
        with conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f"""
                    SELECT id, text 
                    FROM {table_name}
                    WHERE (used IS NULL OR used = false)
                    ORDER BY id ASC
                    LIMIT 1
                """)
                row = cur.fetchone()
                if not row:
                    return None

                qid = row["id"]

                # Only mark as used if not in testing mode
                if not testingMode:
                    cur.execute(f"UPDATE {table_name} SET used = true WHERE id = %s", (qid,))

                return {"id": qid, "text": row["text"]}
    finally:
        conn.close()


def mark_quote_unused(table_name="quotes", quote_id=None):
    if quote_id is None:
        return
    conn = get_pg_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(f"UPDATE {table_name} SET used = false WHERE id = %s", (quote_id,))
    finally:
        conn.close()


# ---------- Job & Theme Helpers ----------
def get_job_json(job_id: str):
    p = config.JOBS_DIR / f"{job_id}.json"
    if not p.exists():
        raise FileNotFoundError(f"Job file not found: {p}")
    return load_json_file(p)


def get_theme_json(theme_name: str):
    if theme_name.endswith(".json"):
        fname = theme_name
    else:
        fname = f"{theme_name}.json"
    p = config.THEMES_DIR / fname
    if not p.exists():
        raise FileNotFoundError(f"Theme not found: {p}")
    return load_json_file(p)
