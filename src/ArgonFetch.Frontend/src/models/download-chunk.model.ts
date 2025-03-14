export interface DownloadChunk {
    start: number;
    end: number;
    loaded: number;
    blob?: Blob;
  }