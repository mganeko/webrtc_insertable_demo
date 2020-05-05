# WebRTC Insertable Streams DEMO

This Repo is trial of WebRTC Insertable Streams.

Refering:
- https://github.com/alvestrand/webrtc-media-streams/blob/master/explainer.md
- WebRTC/Samples - [endtoend-encryption](https://github.com/webrtc/samples/tree/gh-pages/src/content/peerconnection/endtoend-encryption) (BSD 3-Clause LICENSE)

これは WebRTC Insertable Streams のお試しデモです。

参考にしたもの:
- 説明 ... https://github.com/alvestrand/webrtc-media-streams/blob/master/explainer.md
- サンプル ... WebRTC/Samples - [endtoend-encryption](https://github.com/webrtc/samples/tree/gh-pages/src/content/peerconnection/endtoend-encryption) (BSD 3-Clause LICENSE)

## LICENSE / ライセンス

- DEMO ... MIT LICENSE / MITライセンス
- [videopipes.js](https://github.com/webrtc/samples/blob/gh-pages/src/content/peerconnection/endtoend-encryption/js/videopipe.js) (from [webrtc/samples](https://github.com/webrtc/samples)) ... BSD 3-Clause LICENSE


# 利用方法

## 事前準備

- Chrome m83 以上で、#enable-experimental-web-platform-features フラグをオン(enabled)に設定

## GitHub Pages で実行

- Chrome m83以上で、[webrtc_insertable_demo](https://mganeko.github.io/webrtc_insertable_demo/)ページにアクセス
- [Start Video]ボタンをクリックし、カメラから映像を取得
  - 左に映像が表示される
  - [use Audio]がチェックされていると、マイクの音声も取得
- [Connect]ボタンをクリック
  - ブラウザの単一タブ内で2つの「PeerConnectionの通信が確率
  - 右に受信した映像が表示される
- ストリームデータの加工
  - 左の[XOR Sender data]をチェックすると、送信側でストリームのデータを加工
  - 右の[XOR Receiver data]をチェックすると、受信側でストリームのデータを逆加工
  - どちらも加工しない、あるいは加工する場合のみ、正常に右の映像が表示できる

![接続後のXOR切り替え](img/insertable_streams_demo.gif "接続後のXOR切り替え")

- [Disconnect]ボタンをクリックすると通信切断
- [Stop Video]ボタンをクリックすると、映像取得終了




