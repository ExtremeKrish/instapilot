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
    
@app.get("/list_jobs")
def list_jobs():
    jobs_dir = "jobs"
    job_list = []

    if not os.path.exists(jobs_dir):
        return JSONResponse(content={"error": "jobs directory not found"}, status_code=404)

    for filename in os.listdir(jobs_dir):
        if filename.endswith(".json"):
            filepath = os.path.join(jobs_dir, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = json.load(f)
                job_list.append({
                    "filename": filename,
                    "content": content
                })
            except Exception as e:
                job_list.append({
                    "filename": filename,
                    "error": str(e)
                })

    return {"jobs": job_list}


# 👉 Redirect root to /web
@app.get("/")
def root_redirect():
    return RedirectResponse(url="/web")
    
# Serve /web at /web
app.mount("/web", StaticFiles(directory="web", html=True), name="web")

# Serve /output at /output
app.mount("/output", StaticFiles(directory="output"), name="output")
