import { Injectable } from '@angular/core';
import * as mime from 'mime-types';
import { fileTypeFromBuffer } from 'file-type';

@Injectable({
  providedIn: 'root'
})
export class FileTypeService {
  async determineFileExtension(blob: Blob, contentType: string, headers: Record<string, string[]>): Promise<string> {
    // Try to get extension from file content
    try {
      const buffer = await blob.arrayBuffer();
      const fileType = await fileTypeFromBuffer(new Uint8Array(buffer));
      
      if (fileType?.ext) {
        return '.' + fileType.ext;
      }
    } catch (error) {
      console.error('Error detecting file type from buffer:', error);
    }
    
    // Try to get extension from mime type
    const extension = mime.extension(contentType);
    if (extension) {
      return '.' + extension;
    }
    
    // Try to extract from Content-Disposition header
    const contentDispositionKey = Object.keys(headers || {}).find(key => 
      key.toLowerCase() === 'content-disposition');
    
    if (contentDispositionKey && headers[contentDispositionKey][0]) {
      const contentDisposition = headers[contentDispositionKey][0];
      const filenameMatch = /filename=["]?([^"]*)["]?/.exec(contentDisposition);
      
      if (filenameMatch && filenameMatch[1]) {
        const originalFilename = filenameMatch[1];
        const extensionMatch = /\.([^.]+)$/.exec(originalFilename);
        
        if (extensionMatch && extensionMatch[1]) {
          return '.' + extensionMatch[1];
        }
      }
    }
    
    return '.unknown';
  }
}