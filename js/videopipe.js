/*
 *  Copyright (c) 2020 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
//
// A "videopipe" abstraction on top of WebRTC.
//
// The usage of this abstraction:
// var pipe = new VideoPipe(mediastream, handlerFunction);
// handlerFunction = function(mediastream) {
//   do_something
// }
// pipe.close();
//
// The VideoPipe will set up 2 PeerConnections, connect them to each
// other, and call HandlerFunction when the stream is available in the
// second PeerConnection.
//
'use strict';

function VideoPipe(stream, forceSend, forceReceive, handler) {
  this.pc1 = new RTCPeerConnection({
    encodedInsertableStreams: forceSend
  });
  this.pc2 = new RTCPeerConnection({
    encodedInsertableStreams: forceReceive
  });

  stream.getTracks().forEach((track) => this.pc1.addTrack(track, stream));
  this.pc2.ontrack = handler;
}

VideoPipe.prototype.negotiate = async function () {
  this.pc1.onicecandidate = e => {
    if (e.candidate) {
      this.pc2.addIceCandidate(e.candidate);
    }
    else {
      console.log('pc1 candidate empty');
    }
  }
  this.pc2.onicecandidate = e => {
    if (e.candidate) {
      this.pc1.addIceCandidate(e.candidate);
    }
    else {
      console.log('pc2 candidate empty');
    }
  }

  const offer = await this.pc1.createOffer();
  //console.log('offer.sdp: ' + offer.sdp);

  //await this.pc2.setRemoteDescription({ type: 'offer', sdp: offer.sdp.replace('red/90000', 'green/90000') });
  await this.pc2.setRemoteDescription({ type: 'offer', sdp: offer.sdp });
  await this.pc1.setLocalDescription(offer);

  const answer = await this.pc2.createAnswer();
  //console.log('answer.sdp: ' + answer.sdp);

  await this.pc1.setRemoteDescription(answer);
  await this.pc2.setLocalDescription(answer);
};

VideoPipe.prototype.close = function () {
  this.pc1.close();
  this.pc2.close();
};