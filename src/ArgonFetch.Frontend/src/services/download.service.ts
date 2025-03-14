import { Injectable } from '@angular/core';
import { FileTypeService } from './file-type.service';
import { FormatUtils } from '../utils/format.utils';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { ProxyService } from '../../api';
import { DownloadProgress } from '../models/download-progress.model';
import { DownloadChunk } from '../models/download-chunk.model';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  private readonly CHUNK_COUNT = 4;
  
  private progressSubject = new BehaviorSubject<DownloadProgress>({
    progress: 0,
    downloadSpeed: 0,
    downloadSpeedText: '',
    estimatedTimeText: '',
    isDownloading: false
  });
  
  public progress$ = this.progressSubject.asObservable();
  
  private startTime = 0;
  private loadedBytes = 0;
  private totalBytes = 0;
  private speedUpdateInterval: any;
  private chunks: DownloadChunk[] = [];
  private activeRequests = 0;

  constructor(
    private proxyService: ProxyService,
    private fileTypeService: FileTypeService
  ) {}

  async downloadFile(url: string, title: string): Promise<void> {
    if (this.progressSubject.value.isDownloading) return;
    
    this.resetDownloadState();
    
    if (!url) {
      console.error('No URL provided');
      return;
    }
    
    this.updateProgress({ isDownloading: true });
    this.startTime = Date.now();
    
    try {
      const headResponse = await firstValueFrom(this.proxyService.proxyHead(url));
      
      this.totalBytes = headResponse.contentLength ?? 0;
      
      if (!this.totalBytes) {
        throw new Error("Content-Length header is missing");
      }
      
      const contentType: string = headResponse.headers?.[
        Object.keys(headResponse.headers || {}).find(key => key.toLowerCase() === 'content-type') || ''
      ]?.[0] ?? 'application/octet-stream';
      
      const chunkSize: number = Math.floor(this.totalBytes / this.CHUNK_COUNT);
      this.chunks = [];
      
      for (let i: number = 0; i < this.CHUNK_COUNT; i++) {
        const start: number = i * chunkSize;
        const end: number = (i === this.CHUNK_COUNT - 1) ? this.totalBytes - 1 : start + chunkSize - 1;
        this.chunks.push({ start, end, loaded: 0 });
      }
      
      this.speedUpdateInterval = setInterval(() => this.updateSpeed(), 1000);
      
      const downloadPromises: Promise<void>[] = this.chunks.map((chunk, index) =>
        this.downloadChunk(url, chunk, index)
      );
      
      await Promise.all(downloadPromises);
      
      if (this.chunks.every(chunk => chunk.blob)) {
        const completeBlob: Blob = new Blob(
          this.chunks.map(chunk => chunk.blob as Blob),
          { type: contentType }
        );
        
        const fileExtension = await this.fileTypeService.determineFileExtension(
          this.chunks[0].blob as Blob,
          contentType,
          headResponse.headers || {}
        );
        
        const filename: string = title + fileExtension;
        
        const link: HTMLAnchorElement = document.createElement("a");
        link.href = URL.createObjectURL(completeBlob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      this.updateProgress({ isDownloading: false });
      clearInterval(this.speedUpdateInterval);
    }
  }
  
  private async downloadChunk(url: string, chunk: DownloadChunk, chunkIndex: number): Promise<void> {
    this.activeRequests++;
    
    try {
      const response = await firstValueFrom(
        this.proxyService.proxyRange(url, chunk.start, chunk.end)
      );
      
      chunk.blob = response;
      chunk.loaded = response.size;
      this.loadedBytes += response.size;
      
      this.updateProgress({
        progress: Math.round((this.loadedBytes / this.totalBytes) * 100)
      });
    } catch (error) {
      console.error(`Error downloading chunk ${chunkIndex}:`, error);
      throw error;
    } finally {
      this.activeRequests--;
    }
  }
  
  private updateSpeed(): void {
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - this.startTime) / 1000;
    
    if (elapsedSeconds > 0) {
      const downloadSpeed = this.loadedBytes / elapsedSeconds;
      const downloadSpeedText = FormatUtils.formatSpeed(downloadSpeed);
      
      const remainingBytes = this.totalBytes - this.loadedBytes;
      const estimatedSeconds = remainingBytes / downloadSpeed;
      const estimatedTimeText = FormatUtils.formatTime(estimatedSeconds);
      
      this.updateProgress({
        downloadSpeed, 
        downloadSpeedText, 
        estimatedTimeText
      });
    }
  }
  
  private resetDownloadState(): void {
    this.loadedBytes = 0;
    this.totalBytes = 0;
    this.chunks = [];
    
    if (this.speedUpdateInterval) {
      clearInterval(this.speedUpdateInterval);
      this.speedUpdateInterval = null;
    }
    
    this.updateProgress({
      progress: 0,
      downloadSpeed: 0,
      downloadSpeedText: '',
      estimatedTimeText: '',
      isDownloading: false
    });
  }
  
  private updateProgress(progress: Partial<DownloadProgress>): void {
    this.progressSubject.next({
      ...this.progressSubject.value,
      ...progress
    });
  }
  
  ngOnDestroy() {
    if (this.speedUpdateInterval) {
      clearInterval(this.speedUpdateInterval);
    }
  }
}