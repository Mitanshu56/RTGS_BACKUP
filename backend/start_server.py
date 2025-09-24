import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

try:
    import uvicorn
    from app.main import app
    
    print("Starting RTGS Automation Backend Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
except ImportError as e:
    print(f"Import error: {e}")
    print("Please check if all dependencies are installed")
except Exception as e:
    print(f"Error starting server: {e}")