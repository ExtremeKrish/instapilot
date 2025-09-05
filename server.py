from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import job_manager
import config

app = FastAPI()

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

# 👉 Redirect root to /web
@app.get("/")
def root_redirect():
    return RedirectResponse(url="/web")
    
# Serve /web at /web
app.mount("/web", StaticFiles(directory="web", html=True), name="web")

# Serve /output at /output
app.mount("/output", StaticFiles(directory="output"), name="output")
