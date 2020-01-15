import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-ffmpeg',
  templateUrl: './ffmpeg.component.html',
  styleUrls: ['./ffmpeg.component.scss']
})
export class FfmpegComponent implements OnInit {

  worker;
  isWorkerLoaded = false;
  outputMessage = '';
  running = false;
  videoData;

  constructor() { }

  @Input() afterFilePicked: BehaviorSubject <any> ;

  isReady() {
    return !this.running && this.isWorkerLoaded && this.videoData;
  }

  startRunning() {
    this.outputMessage = '';
    this.running = true;
  }
  stopRunning() {
    this.running = false;
  }

  parseArguments(text: string) {
    text = text.replace(/\s+/g, ' ');
    let args = [];
    // Allow double quotes to not split args.
    text.split('"').forEach((t: string, i: number) => {
      t = t.trim();
      if ((i % 2) === 1) {
        args.push(t);
      } else {
        args = args.concat(t.split(' '));
      }
    });
    return args;
  }

  runCommand(text: string) {
    if (this.isReady()) {
      this.startRunning();
      const args = this.parseArguments(text);
      console.log(args);
      this.worker.postMessage({
        type: 'command',
        arguments: args,
        files: [
          {
            name: this.videoData.name,
            data: this.videoData.content
          }
        ]
      });
    }
  }

  initWorker() {
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker = new Worker('./ffmpeg.worker', { type: 'module' });
      this.worker.onmessage = ({data}) => {
        console.log('>>> this.worker.onmessage')
        console.log(data)
        // console.log(`page got message: ${data}`);
        const message = data;
        if (message.type === 'ready') {
          this.isWorkerLoaded = true;
          this.worker.postMessage({
            type: 'command',
            arguments: ['-help']
          });
        } else if (message.type === 'stdout') {
          this.outputMessage += message.data + '\n';
        } else if (message.type === 'start') {
          this.outputMessage = 'Worker has received command\n';
        } else if (message.type === 'done') {
          this.stopRunning();
          // const buffers = message.data;
          // if (buffers.length) {
          //   // this.outputMessage.className = 'closed';
          // }
          // buffers.forEach(file => {
          //   // filesElement.appendChild(getDownloadLink(file.data, file.name));
          // });
        }

      };
      this.worker.postMessage('hello');
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

  init() {
    this.afterFilePicked.subscribe(file => {
      this.videoData = file;
      if (!this.worker) {
        this.initWorker();
      }
      this.runCommand('-help');
    });
  }

  ngOnInit() {
    this.init();
  }

}
