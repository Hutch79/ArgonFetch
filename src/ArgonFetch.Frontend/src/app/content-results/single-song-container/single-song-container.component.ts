import { Component, Input } from '@angular/core';
import { faDownload, faSpinner, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ProxyService, ResourceInformationDto } from '../../../../api';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-single-song-container',
  imports: [
    FontAwesomeModule,
    NgIf
  ],
  templateUrl: './single-song-container.component.html',
  styleUrls: ['./single-song-container.component.scss']
})
export class SingleSongContainerComponent {
  @Input() resourceInformation!: ResourceInformationDto;

  faDownload = faDownload;
  faSpinner = faSpinner;
  faCheck = faCheck;
  faTimes = faTimes;

  isDownloading = false;
  downloadProgress = 0;
  downloadSpeedText = '';
  estimatedTimeText = '';

  showDownloadConfirmation = false;

  constructor(private proxyService: ProxyService) {}

  toggleDownloadConfirmation() {
    this.showDownloadConfirmation = !this.showDownloadConfirmation;
  }

  cancelDownload() {
    this.showDownloadConfirmation = false;
  }

  startDownload(): void {
    if (!this.resourceInformation || !this.resourceInformation.mediaItems![0]!.streamingUrl) {
      console.error('Invalid resource information');
      return;
    }

    this.showDownloadConfirmation = false;
    this.isDownloading = true;
    this.downloadProgress = 0;

    // Simulated download progress
    const interval = setInterval(() => {
      if (this.downloadProgress < 100) {
        this.downloadProgress += 10;
        this.downloadSpeedText = '1.2 MB/s';
        this.estimatedTimeText = `${Math.max(0, (100 - this.downloadProgress) / 10)}s left`;
      } else {
        clearInterval(interval);
        this.isDownloading = false;
      }
    }, 1000);
  }
}
