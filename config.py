# config.py
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present
env_path = Path('.') / '.env'
if env_path.exists():
    load_dotenv(env_path)

# Required env vars:
NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL", "postgresql://neondb_owner:npg_elDoLt9vEw8F@ep-jolly-field-ad8fhzqq-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")   # your Neon Postgres URL
JOB_SECRET = os.getenv("JOB_SECRET", "lucifer")        # secret to protect /run_job endpoint
IG_ACCESS_TOKEN = os.getenv("IG_ACCESS_TOKEN", "")      # Instagram Graph API long lived token
IG_API_VERSION = os.getenv("IG_API_VERSION", "v19.0")   # adjust if needed

# Paths
BASE_DIR = Path(__file__).parent.resolve()
JOBS_DIR = BASE_DIR / "jobs"
THEMES_DIR = BASE_DIR / "themes"
CAPTIONS_DIR = BASE_DIR / "captions"
BG_DIR = BASE_DIR / "bg_images"
FONTS_DIR = BASE_DIR / "fonts"
OUTPUT_DIR = BASE_DIR / "output"

# Make sure output exists
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
