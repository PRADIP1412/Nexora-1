from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from repositories.product_catalog.media_repository import MediaRepository
from utils.file_upload import save_upload_file, delete_file
from typing import Dict, Any

class MediaService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = MediaRepository()
    
    async def upload_product_image(self, variant_id: int, file: UploadFile) -> Dict[str, Any]:
        """Upload product image"""
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        file_path = await save_upload_file(file, subfolder="products")
        
        existing_images = self.repository.count_variant_images(self.db, variant_id)
        is_default = existing_images == 0
        
        new_image = self.repository.create_image(self.db, {
            "variant_id": variant_id,
            "url": file_path,
            "is_default": is_default
        })
        
        return {
            "image_id": new_image.image_id,
            "variant_id": new_image.variant_id,
            "url": new_image.url,
            "is_default": new_image.is_default
        }
    
    async def delete_product_image(self, image_id: int) -> Dict[str, str]:
        """Delete product image"""
        image = self.repository.get_image_by_id(self.db, image_id)
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        await delete_file(image.url)
        self.repository.delete_image(self.db, image)
        
        return {"message": "Image deleted successfully"}
    
    def set_default_image(self, variant_id: int, image_id: int) -> Dict[str, str]:
        """Set default image for variant"""
        # Set all images to not default
        self.repository.update_variant_images_default(self.db, variant_id, False)
        
        # Set the specified image as default
        image = self.repository.get_image_by_id(self.db, image_id)
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        self.repository.update_image(self.db, image, {"is_default": True})
        
        return {"message": "Default image updated successfully"}
    
    async def upload_product_video(self, variant_id: int, file: UploadFile) -> Dict[str, Any]:
        """Upload product video"""
        if not file.content_type.startswith("video/"):
            raise HTTPException(status_code=400, detail="File must be a video")
        
        file_path = await save_upload_file(file, subfolder="products/videos")
        
        new_video = self.repository.create_video(self.db, {
            "variant_id": variant_id,
            "url": file_path,
            "is_default": False
        })
        
        return {
            "video_id": new_video.video_id,
            "variant_id": new_video.variant_id,
            "url": new_video.url,
            "is_default": new_video.is_default
        }
    
    async def delete_product_video(self, video_id: int) -> Dict[str, str]:
        """Delete product video"""
        video = self.repository.get_video_by_id(self.db, video_id)
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        
        await delete_file(video.url)
        self.repository.delete_video(self.db, video)
        
        return {"message": "Video deleted successfully"}