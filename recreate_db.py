#!/usr/bin/env python3
"""
Script to recreate database tables with updated schema
"""
import os
import sys

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.database import engine, Base
from backend.app.models import User, Remitter, Beneficiary, Transaction

def recreate_tables():
    """Drop and recreate all tables"""
    print("Recreating database tables...")
    
    # Drop all existing tables
    Base.metadata.drop_all(bind=engine)
    print("Dropped existing tables.")
    
    # Create all tables with new schema
    Base.metadata.create_all(bind=engine)
    print("Created new tables with updated schema.")
    
    print("Database schema update complete!")

if __name__ == "__main__":
    recreate_tables()