from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.utils.auth import get_admin_user
from app.models.user import User
import cloudinary
import cloudinary.uploader
import os

router = APIRouter()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.getenv("CLOUDINARY_API_KEY", ""),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", ""),
    secure=True,
)

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    admin: User = Depends(get_admin_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")
    if file.size and file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    contents = await file.read()
    try:
        result = cloudinary.uploader.upload(
            contents,
            folder="canvas-to-dreams/paintings",
            transformation=[
                {"quality": "auto:best"},
                {"fetch_format": "auto"},
            ]
        )
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "width": result.get("width"),
            "height": result.get("height"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.delete("/image/{public_id:path}")
async def delete_image(
    public_id: str,
    admin: User = Depends(get_admin_user)
):
    try:
        cloudinary.uploader.destroy(public_id)
        return {"message": "Image deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")
