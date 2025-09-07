import os
import json
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
import job_manager
import config
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from fastapi import Depends
from fastapi.responses import PlainTextResponse
from fastapi import Request

# login 6 line
from starlette.middleware.sessions import SessionMiddleware

from fastapi import Form
from fastapi.responses import RedirectResponse
from starlette.responses import FileResponse
from pathlib import Path


app = FastAPI()

# login 1 line
app.add_middleware(SessionMiddleware, secret_key="lucifer")

# Add this after creating `app = FastAPI()`
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allows all origins, change to specific domains for security
    allow_credentials=True,
    allow_methods=["*"],  # allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # allows all headers
)

@app.post("/login")
def login(request: Request, username: str = Form(...), password: str = Form(...)):
    if username == "admin" and password == "1234":  # replace later with DB check
        request.session["user"] = username
        return RedirectResponse(url="/web/", status_code=303)
    return {"error": "Invalid credentials"}

@app.get("/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/login.html")
# ------------------- Existing -------------------

@app.get("/run_job")
def run_job(job_id: str, secret: str):
    if secret != config.JOB_SECRET:
        raise HTTPException(status_code=403, detail="Invalid secret")
    try:
        res = job_manager.run_job(job_id)
        if not res.get("ok"):
            raise HTTPException(status_code=500, detail=res.get("error", "unknown"))
        return res
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/jinda")
def ping():
    return {"status": "alive"}

# ------------------- File CRUD Helpers -------------------

def get_json_file(folder: str, filename: str):
    filepath = os.path.join(folder, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json_file(folder: str, filename: str, content: dict):
    os.makedirs(folder, exist_ok=True)
    filepath = os.path.join(folder, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(content, f, indent=2, ensure_ascii=False)
    return {"ok": True, "filename": filename}

def delete_json_file(folder: str, filename: str):
    filepath = os.path.join(folder, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(filepath)
    return {"ok": True, "deleted": filename}

# ------------------- CRUD Routes -------------------

@app.get("/{folder}/list")
def list_files(folder: str):
    if folder not in ["jobs", "themes", "captions", "bg_images"]:
        raise HTTPException(status_code=400, detail="Invalid folder")
    files = []
    for f in os.listdir(folder):
        if f.endswith(".json") or f.endswith(".txt") or f.endswith(".png") or f.endswith(".jpg"):
            files.append(f)
    return {"files": files}

@app.get("/{folder}/get/{filename}")
def read_file(folder: str, filename: str):
    if folder not in ["jobs", "themes", "captions"]:
        raise HTTPException(status_code=400, detail="Invalid folder")

    filepath = os.path.join(folder, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")

    # Handle JSON files
    if filename.endswith(".json"):
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    # Handle TXT files but still return JSON
    if filename.endswith(".txt"):
        with open(filepath, "r", encoding="utf-8") as f:
            return {"content": f.read()}

    raise HTTPException(status_code=400, detail="Unsupported file type")


@app.post("/{folder}/create/{filename}")
async def create_file(folder: str, filename: str, request: Request):
    if folder not in ["jobs", "themes", "captions"]:
        raise HTTPException(status_code=400, detail="Invalid folder")

    os.makedirs(folder, exist_ok=True)
    filepath = os.path.join(folder, filename)

    if filename.endswith(".json"):
        content = await request.json()
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(content, f, indent=2, ensure_ascii=False)
        return {"ok": True, "filename": filename, "type": "json"}

    elif filename.endswith(".txt"):
        content = await request.body()
        text = content.decode("utf-8")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(text)
        return {"ok": True, "filename": filename, "type": "text", "bytes_written": len(text)}

    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")


@app.put("/{folder}/update/{filename}")
async def update_file(folder: str, filename: str, request: Request):
    if folder not in ["jobs", "themes", "captions"]:
        raise HTTPException(status_code=400, detail="Invalid folder")

    # Check if it's JSON or TXT
    if filename.endswith(".json"):
        content = await request.json()
        return save_json_file(folder, filename, content)

    elif filename.endswith(".txt"):
        content = await request.body()
        text = content.decode("utf-8")
        filepath = os.path.join(folder, filename)
        os.makedirs(folder, exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(text)
        return {"ok": True, "filename": filename, "bytes_written": len(text)}

    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")


@app.put("/{folder}/rename/{old_filename}")
def rename_file(folder: str, old_filename: str, new_filename: str = Body(..., embed=True)):
    """
    Rename a file inside jobs/themes/captions.
    Body: { "new_filename": "something.json" }
    """
    if folder not in ["jobs", "themes", "captions", "bg_images", "fonts", "jobs", "themes"]:
        raise HTTPException(status_code=400, detail="Invalid folder")

    old_path = os.path.join(folder, old_filename)
    new_path = os.path.join(folder, new_filename)

    if not os.path.exists(old_path):
        raise HTTPException(status_code=404, detail="File not found")

    if os.path.exists(new_path):
        raise HTTPException(status_code=409, detail="New filename already exists")

    os.rename(old_path, new_path)
    return {"ok": True, "old": old_filename, "new": new_filename}
    
    
@app.delete("/{folder}/delete/{filename}")
def remove_file(folder: str, filename: str):
    if folder not in ["jobs", "themes", "captions", "bg_images", "fonts", "jobs", "themes"]:
        raise HTTPException(status_code=400, detail="Invalid folder")
    return delete_json_file(folder, filename)

# =========== QUOTES FETCH API'S=============

# ---- Helper ----
def get_pg_conn():
    url = config.NEON_DATABASE_URL
    if not url:
        raise RuntimeError("NEON_DATABASE_URL not set in env")
    return psycopg2.connect(url)

# ---- API: List Tables ----
@app.get("/db/tables")
def list_tables():
    try:
        conn = get_pg_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema='public'
            ORDER BY table_name;
        """)
        tables = [row[0] for row in cur.fetchall()]
        cur.close()
        conn.close()
        return {"tables": tables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- API: Get Table Data with Pagination ----
@app.get("/db/{table_name}")
def get_table_data(table_name: str, page: int = 1, limit: int = 20):
    try:
        conn = get_pg_conn()
        cur = conn.cursor()

        # Pagination calc
        offset = (page - 1) * limit

        # Count total rows
        cur.execute(f"SELECT COUNT(*) FROM {table_name};")
        total_rows = cur.fetchone()[0]

        # Fetch data
        cur.execute(f"""
            SELECT id, text, used
            FROM {table_name}
            ORDER BY id
            LIMIT %s OFFSET %s;
        """, (limit, offset))

        rows = cur.fetchall()
        cur.close()
        conn.close()

        data = [
            {"index": r[0], "text": r[1], "used": r[2]}
            for r in rows
        ]

        return {
            "table": table_name,
            "page": page,
            "limit": limit,
            "total": total_rows,
            "rows": data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# login -------------------------
WEB_DIR = Path("web")
@app.get("/web/{file_path:path}")
def protected_web(request: Request, file_path: str = ""):
    # If no file given, serve index.html
    if file_path == "":
        file_path = "index.html"

    # Always allow login.html
    if file_path == "login.html":
        full_path = WEB_DIR / "login.html"
        if full_path.is_file():
            return FileResponse(full_path)
        raise HTTPException(status_code=404, detail="Login page missing")

    # Require session for everything else
    if not request.session.get("user"):
        return RedirectResponse(url="/web/login.html")

    # Serve requested file
    full_path = WEB_DIR / file_path
    if full_path.is_file():
        return FileResponse(full_path)

    raise HTTPException(status_code=404, detail="File not found")

# ------------------- Static Mounts -------------------

# app.mount("/web", StaticFiles(directory="web", html=True), name="web")
app.mount("/output", StaticFiles(directory="output"), name="output")
app.mount("/bg_images", StaticFiles(directory="bg_images"), name="bg_images")
app.mount("/fonts", StaticFiles(directory="fonts"), name="fonts")
app.mount("/jobs", StaticFiles(directory="jobs"), name="jobs")
app.mount("/captions", StaticFiles(directory="captions"), name="captions")
app.mount("/themes", StaticFiles(directory="themes"), name="themes")

@app.get("/")
def root_redirect():
    return RedirectResponse(url="/web")
