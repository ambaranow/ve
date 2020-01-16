/// <reference lib="webworker" />

importScripts('/assets/ffmpeg.js');
// const { ffmpeg } = require('./../../assets/ffmpeg');

// import { Module as ffmpeg } from '@ffmpeg/ffmpeg';

// addEventListener('message', ({data}) => {
//   // const response = `worker response to ${data}`;
//   postMessage(data);
// });


const now = Date.now;

function print(text) {
  postMessage({
    type : 'stdout',
    data : text
  });
}

addEventListener('message', ({ data }) => {
  const message = data;
  if (message.type === 'command') {

    const Module = {
      print,
      printErr: print,
      files: message.files || [],
      arguments: message.arguments || [],
      // TOTAL_MEMORY: message.TOTAL_MEMORY || false
      // TOTAL_MEMORY: false,
      ALLOW_MEMORY_GROWTH: true,
      // Can play around with this option - must be a power of 2
      // TOTAL_MEMORY: 268435456
      TOTAL_MEMORY: 1073741824
    };

    postMessage({
      type : 'start',
      data : Module.arguments.join(' ')
    });

    postMessage({
      type : 'stdout',
      data : 'Received command: ' +
                Module.arguments.join(' ') +
                ((Module.TOTAL_MEMORY) ? '.  Processing with ' + Module.TOTAL_MEMORY + ' bits.' : '')
    });

    const time = now();
    const result = ffmpeg_run(Module);
    // const result = '';

    const totalTime = now() - time;
    postMessage({
      type : 'stdout',
      data : 'Finished processing (took ' + totalTime + 'ms)'
    });

    postMessage({
      type : 'done',
      data : result,
    });
  }
});

postMessage({
  type : 'ready'
});
