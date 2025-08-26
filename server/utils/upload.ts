import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { env } from '../env';
import fs from 'fs';

// Ensure upload directory exists
if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

// File filter for security
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF) and documents (PDF, DOC, DOCX) are allowed.'));
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories based on file type
    const fileType = file.mimetype.startsWith('image/') ? 'images' : 'documents';
    const uploadPath = path.join(env.UPLOAD_DIR, fileType);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  
  filename: (req, file, cb) => {
    // Generate safe filename with timestamp
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(extension, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
    
    const filename = `${timestamp}_${randomString}_${safeName}${extension}`;
    cb(null, filename);
  }
});

// Create multer instance with configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files per request
  },
});

// Utility functions
export const uploadUtils = {
  // Get file URL for serving
  getFileUrl: (filename: string, fileType: 'images' | 'documents' = 'images'): string => {
    return `/uploads/${fileType}/${filename}`;
  },
  
  // Delete file from disk
  deleteFile: (filepath: string): boolean => {
    try {
      const fullPath = path.join(env.UPLOAD_DIR, filepath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  },
  
  // Validate file size
  isValidFileSize: (file: Express.Multer.File, maxSizeMB: number = 10): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },
  
  // Get file type category
  getFileCategory: (mimetype: string): 'image' | 'document' | 'unknown' => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.includes('pdf') || mimetype.includes('document')) return 'document';
    return 'unknown';
  },
  
  // Generate thumbnail for images (placeholder for future implementation)
  generateThumbnail: async (imagePath: string): Promise<string | null> => {
    // TODO: Implement image thumbnail generation using sharp or similar library
    // For now, return null to indicate no thumbnail
    return null;
  }
};

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Middleware for multiple file upload
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => 
  upload.array(fieldName, maxCount);

// Middleware for mixed file upload (different field names)
export const uploadFields = (fields: { name: string; maxCount: number }[]) => 
  upload.fields(fields);