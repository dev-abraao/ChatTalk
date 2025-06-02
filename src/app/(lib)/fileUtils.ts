// Utility functions for file handling
export function isImageFile(mimetype: string): boolean {
  return mimetype.startsWith("image/");
}

export function isVideoFile(mimetype: string): boolean {
  return mimetype.startsWith("video/");
}

export function getFileType(mimetype: string): "image" | "video" | undefined {
  if (isImageFile(mimetype)) return "image";
  if (isVideoFile(mimetype)) return "video";
  return undefined;
}

export function getSupportedFileTypes(): string[] {
  return [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    // Videos
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/avi",
    "video/mov",
    "video/quicktime",
  ];
}

export function isFileTypeSupported(mimetype: string): boolean {
  return getSupportedFileTypes().includes(mimetype);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
