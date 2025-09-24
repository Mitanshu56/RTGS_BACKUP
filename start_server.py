#!/usr/bin/env python3
import os
import sys
import subprocess

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Change to the backend directory
backend_dir = os.path.join(script_dir, "backend")
os.chdir(backend_dir)

# Activate virtual environment
venv_python = os.path.join(backend_dir, "venv", "Scripts", "python.exe")

# Start the server
subprocess.run([
    venv_python, "-m", "uvicorn", 
    "app.main:app", 
    "--host", "0.0.0.0", 
    "--port", "8000"
])