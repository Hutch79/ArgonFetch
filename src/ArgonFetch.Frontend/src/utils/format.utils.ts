export class FormatUtils {
    static formatSpeed(bytesPerSecond: number): string {
      if (bytesPerSecond > 1048576) {
        return (bytesPerSecond / 1048576).toFixed(2) + ' MB/s';
      } else {
        return (bytesPerSecond / 1024).toFixed(2) + ' KB/s';
      }
    }
  
    static formatTime(seconds: number): string {
      if (seconds === Infinity || isNaN(seconds)) {
        return 'calculating...';
      }
  
      if (seconds < 60) {
        return Math.ceil(seconds) + ' sec';
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.ceil(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
      } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
      }
    }
  }