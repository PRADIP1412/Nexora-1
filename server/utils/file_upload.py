import os
import uuid
from fastapi import UploadFile, HTTPException
from typing import List

UPLOAD_DIR = "uploads"
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_upload_file(file: UploadFile, subfolder: str = "general") -> str:
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    # Create unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, subfolder, unique_filename)
    
    # Create subfolder if not exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size too large")
        buffer.write(content)
    
    return f"/{file_path}"

async def delete_file(file_path: str):
    try:
        if os.path.exists(file_path.lstrip("/")):
            os.remove(file_path.lstrip("/"))
    except Exception as e:
        print(f"Error deleting file: {e}")