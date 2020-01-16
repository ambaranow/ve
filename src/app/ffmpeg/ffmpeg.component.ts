import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ReadFile } from 'ngx-file-helpers';
import { DomSanitizer } from '@angular/platform-browser';

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

  keyFrames = [];

  workerReady: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

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
      // console.log(args);
      this.worker.postMessage({
        type: 'command',
        arguments: args,
        files: [
          {
            name: this.getFileName(this.videoData),
            data: this.dataURLtoU8arr(this.videoData.content)
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
        // console.log('>>> this.worker.onmessage');
        // console.log(data)
        // console.log(`page got message: ${data}`);
        const message = data;
        if (message.type === 'ready') {
          this.isWorkerLoaded = true;
          this.workerReady.next(null);
          // this.worker.postMessage({
          //   type: 'command',
          //   arguments: ['-help']
          // });
        } else if (message.type === 'stdout') {
          this.outputMessage += message.data + '\n';
        } else if (message.type === 'start') {
          this.outputMessage = 'Worker has received command\n';
        } else if (message.type === 'done') {
          this.stopRunning();
          this.keyFrames = [];
          const buffers = message.data;
          if (buffers.length) {
            // this.outputMessage.className = 'closed';
          }
          buffers.forEach(file => {
            // console.log('file')
            // console.log(file);
            const blob = new Blob([file.data], { type: 'image/jpeg' } );
            const imageUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL( blob ));
            this.keyFrames.push(imageUrl);
            // filesElement.appendChild(getDownloadLink(file.data, file.name));
          });
        }

      };
      this.worker.postMessage('hello');
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

  dataURLtoU8arr(dataurl) {
    const arr = dataurl.split(',');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return u8arr;
  }

  // retrieveSampleVideo() {
  //   const oReq = new XMLHttpRequest();
  //   oReq.open('GET', '/assets/bigbuckbunny.webm', true);
  //   oReq.responseType = 'arraybuffer';
  //   oReq.onload = (oEvent) => {
  //     const arrayBuffer = oReq.response;
  //     if (arrayBuffer) {
  //       console.log('+++++ retrieveSampleVideo')
  //       console.log(arrayBuffer)
  //       console.log(new Uint8Array(arrayBuffer))
  //       console.log('----- retrieveSampleVideo')
  //       // sampleVideoData = new Uint8Array(arrayBuffer);
  //     }
  //   };
  //   oReq.send(null);
  // }

  getFileName(file: ReadFile) {
    // const reader = new FileReader();
    // console.log(this.dataURItoBlob(file.content))
    // console.log(reader.readAsBinaryString(file.underlyingFile.));
    // console.log(file.content)
    const extensionRegExp = /\.([0-9a-z]{1,5})$/i;
    const extension = file.name.match(extensionRegExp)[1];
    // file.name = 'video.' + extension.toLowerCase();
    // const fileReader = new FileReader();
    // const newFile = new File([this.dataURItoBlob(file.content)], 'video.' + extension.toLowerCase(), {type: file.underlyingFile.type});
    // console.log(newFile)
    // // const newFile = file;
    // console.log('========')
    return 'video.' + extension.toLowerCase();
  }

  init() {
    this.afterFilePicked.subscribe((file: ReadFile) => {
      // console.log(file)
      this.videoData = file;
      if (!this.worker) {
        this.initWorker();
      }
      this.workerReady.subscribe(() => {

        // this.runCommand('-version')
        // this.runCommand('-buildconf');
        this.runCommand('-i ' + this.getFileName(this.videoData) + ' -f image2 -vf fps=fps=1,showinfo -an out%d.jpeg');
      });
    });
  }

  ngOnInit() {
    // this.retrieveSampleVideo()

    this.init();
  }

}
