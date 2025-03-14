export interface DownloadProgress {
    progress: number;
    downloadSpeed: number;
    downloadSpeedText: string;
    estimatedTimeText: string;
    isDownloading: boolean;
  }