# server.py
from fastapi import FastAPI, HTTPException, Query
import job_manager
import config

app = FastAPI()

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