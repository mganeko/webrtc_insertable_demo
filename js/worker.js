//
// https://github.com/webrtc/samples/blob/gh-pages/src/content/insertable-streams/endtoend-encryption/js/worker.js
//

// OK: Firefox Nightly 118
// NG: Safari 16.6
//    VP8 でない？

'use strict';

// Handler for RTCRtpScriptTransforms.
if (self.RTCTransformEvent) {
  self.onrtctransform = (event) => {
    const transformer = event.transformer;
    handleTransform(transformer.options.operation, transformer.readable, transformer.writable);
  };
}


// Handler for messages, including transferable streams.
onmessage = (event) => {
  console.log('onMessage: ' + event.data.operation);
  if (event.data.operation === 'setEncript') {
    invertSender = event.data.encriptSender;
    invertReceiver = event.data.encriptReceiver;
    console.log('onMessage(setEncript) : invertSender=' + invertSender + ', invertReceiver=' + invertReceiver);
  }
};

function handleTransform(operation, readable, writable) {
  if (operation === 'encode') {
    console.log('handleTransform: encode');
    resetDumpCount();
    const transformStream = new TransformStream({
      transform: encodeFunction,
    });
    readable
      .pipeThrough(transformStream)
      .pipeTo(writable);
  } else if (operation === 'decode') {
    console.log('handleTransform: decode');
    const transformStream = new TransformStream({
      transform: decodeFunction,
    });
    readable
      .pipeThrough(transformStream)
      .pipeTo(writable);
  }
}



  // --- encode / decode ---
  let scount = 0;
  let rcount = 0;
  const MAX_DUMP_COUNT = 10;
  const xorMask = 0xff;
  const additionalSize = 0;
  const additionalByte = 0xcc;

  let invertSender = false;
  let invertReceiver = false;

  // for VP8
  // https://tools.ietf.org/html/rfc6386#section-9.1
  const frameTypeToCryptoOffset = {
    key: 10,
    delta: 3,
    undefined: 1,
  };

  // for H264
  //  https://tools.ietf.org/html/rfc6184#section-5.1
  //  https://tex2e.github.io/rfc-translater/html/rfc6184.html
  //  but by try and error, the offset is different from the RFC.
  const frameTypeToCryptoOffsetH264 = {
    key: 38, //16,  // 64 OK, 48 OK, 40 OK, 38 OK, 37 NG, 36 NG, 32 NG, 
    delta: 4, //16, // 32 OK, 16 OK, 8 OK, 4 OK, 3 NG
    undefined: 1,
  };


  function encodeFunction(chunk, controller) {
    if (scount++ < MAX_DUMP_COUNT) { // dump the first MAX_DUMP_COUNT packets.
      dump(chunk, 'send');
    }
    // else if (chunk.type === 'key') {
    //   dump(chunk, 'send');
    // }

    // --- new data ----
    const view = new DataView(chunk.data);
    const newData = new ArrayBuffer(chunk.data.byteLength + additionalSize);
    const newView = new DataView(newData);
    //const cryptoOffset = frameTypeToCryptoOffset[chunk.type];
    const cryptoOffset = frameTypeToCryptoOffsetH264[chunk.type];

    for (let i = 0; i < chunk.data.byteLength; i++) {
      // --- copy header --
      if (i < cryptoOffset) {
        // just copy
        newView.setInt8(i, view.getInt8(i));
        continue;
      }

      if (invertSender) {
        // --- invert(XOR) copy ---
        newView.setInt8(i, view.getInt8(i) ^ xorMask);
      }
      else {
        // --- just copy ---
        newView.setInt8(i, view.getInt8(i));
      }
    }

    // -- additional data --
    for (let i = 0; i < additionalSize; i++) {
      newView.setUint8(chunk.data.byteLength + i, additionalByte);
    }
    chunk.data = newData;

    // --- queue new chunk ---
    controller.enqueue(chunk);
  }


  function decodeFunction(chunk, controller) {
    if (rcount++ < MAX_DUMP_COUNT) { // dump the first MAX_DUMP_COUNT packets.
      dump(chunk, 'recv');
    }
    // else if (chunk.type === 'key') {
    //   dump(chunk, 'recv');
    // }

    // --- new data ----
    const view = new DataView(chunk.data);
    const newData = new ArrayBuffer(chunk.data.byteLength - additionalSize);
    const newView = new DataView(newData);
    //const cryptoOffset = frameTypeToCryptoOffset[chunk.type];
    const cryptoOffset = frameTypeToCryptoOffsetH264[chunk.type];

    for (let i = 0; i < chunk.data.byteLength - additionalSize; i++) {
      // --- copy header --
      if (i < cryptoOffset) {
        // -- just copy --
        newView.setInt8(i, view.getInt8(i));
        continue;
      }

      if (invertReceiver) {
        // --- invert(XOR) copy ---
        newView.setInt8(i, view.getInt8(i) ^ xorMask);
      }
      else {
        // --- just copy ---
        newView.setInt8(i, view.getInt8(i));
      }
    }
    chunk.data = newData;

    // --- queue new chunk ---
    controller.enqueue(chunk);
  }

  function resetDumpCount() {
    scount = 0;
    rcount = 0;
  }

  // chunk:
  //  interface RTCEncodedVideoFrame {
  //     readonly attribute RTCEncodedVideoFrameType type;
  //     readonly attribute unsigned long long timestamp;
  //     attribute ArrayBuffer data;
  //     readonly attribute ArrayBuffer additionalData;
  //     readonly attribute unsigned long synchronizationSource;
  // };

  function dump(chunk, direction, max = 16) {
    const data = new Uint8Array(chunk.data);
    let bytes = '';
    for (let j = 0; j < data.length && j < max; j++) {
      bytes += (data[j] < 16 ? '0' : '') + data[j].toString(16) + ' ';
    }
    console.log(performance.now().toFixed(2), direction, bytes.trim(),
      'len=' + chunk.data.byteLength,
      'type=' + (chunk.type || 'audio'),
      'ts=' + chunk.timestamp,
      'ssrc=' + chunk.synchronizationSource
    );
  }