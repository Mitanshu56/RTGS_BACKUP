from fastapi import FastAPI

app = FastAPI(title="RTGS Automation API", version="1.0.0")

@app.get("/")
async def root():
    return {
        "message": "Welcome to RTGS Automation API",
        "version": "1.0.0",
        "status": "working"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)