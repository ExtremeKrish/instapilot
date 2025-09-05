# server.py
from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import job_manager
import config
import os

app = FastAPI()

# Mount static files (your /web folder)
app.mount("/", StaticFiles(directory="web", html=True), name="web")

# Serve index.html at root "/"
@app.get("/")
def serve_root():
    index_path = os.path.join("web", "index.html")
    return FileResponse(index_path)


@app.get("/run_job")
def run_job(job_id: str = Query(...), secret: str = Query(...)):
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
    """Keep-alive endpoint for Render free tier"""
    return {"status": "alive"}
