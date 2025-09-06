import os
import json
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
import job_manager
import config

app = FastAPI()

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
    if folder not in ["jobs", "themes", "captions"]:
        raise HTTPException(status_code=400, detail="Invalid folder")
    files = []
    for f in os.listdir(folder):
        if f.endswith(".json") or f.endswith(".txt"):
            files.append(f)
    return {"files": files}

@app.get("/{folder}/get/{filename}")
def read_file(folder: str, filename: str):
    if folder not in ["jobs", "themes", "captions"]:
        raise HTTPException(status_code=400, detail="Invalid folder")
    return get_json_file(folder, filename)

@app.post("/{folder}/create/{filename}")
def create_file(folder: str, filename: str, content: dict = Body(...)):
    if folder not in ["jobs", "themes", "captions"]:
        raise HTTPException(status_code=400, detail="Invalid folder")
    return save_json_file(folder, filename, content)

@app.put("/{folder}/update/{filename}")
def update_file(folder: str, filename: str, content: dict = Body(...)):
    if folder not in ["jobs", "themes", "captions"]:
        raise HTTPException(status_code=400, detail="Invalid folder")
    return save_json_file(folder, filename, content)

@app.delete("/{folder}/delete/{filename}")
def remove_file(folder: str, filename: str):
    if folder not in ["jobs", "themes", "captions"]:
        raise HTTPException(status_code=400, detail="Invalid folder")
    return delete_json_file(folder, filename)

# ------------------- Static Mounts -------------------

app.mount("/web", StaticFiles(directory="web", html=True), name="web")
app.mount("/output", StaticFiles(directory="output"), name="output")
app.mount("/bg_images", StaticFiles(directory="bg_images"), name="bg_images")
app.mount("/fonts", StaticFiles(directory="fonts"), name="fonts")
app.mount("/jobs", StaticFiles(directory="jobs"), name="jobs")
app.mount("/captions", StaticFiles(directory="captions"), name="captions")
app.mount("/themes", StaticFiles(directory="themes"), name="themes")

@app.get("/")
def root_redirect():
    return RedirectResponse(url="/web")
