import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-download-result',
  imports: [],
  templateUrl: './download-result.component.html',
  styleUrl: './download-result.component.scss'
})
export class DownloadResultComponent {
  @Input() progress: number = 0;
  @Input() downloadSpeedText: string = '';
  @Input() estimatedTimeText: string = '';
  @Input() isDownloading: boolean = false;
}
