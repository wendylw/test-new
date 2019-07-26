import React, { Component } from 'react';
import QrcodeDecoder from 'qrcode-decoder';
import { withRouter } from 'react-router-dom';
import Constants from '../../Constants';

const processQR = (qrData) => new Promise((resolve, reject) => {
  const data = qrData.trim();
  if (/^https?:/.test(data)) {
    window.location.href = data;
    resolve(data)
  } else {
    reject('Not Identified')
  }
})

class Scanner extends Component {
  componentDidMount() {
    this.props.history.push({
      pathname: Constants.ALL_ROUTER.notSupport,
      state: { isIOS: true }
    })
    this.getCamera();
  }

  getCamera() {
    //turn on the camera
    try {
      let that = this;

      const videoObj = { video: { facingMode: "environment" }, audio: false },
        MediaErr = function (error) {
          if (error.name === 'NotAllowedError') {
            // that.props.history.push(Constants.ALL_ROUTER.permission);
          } else {
            if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
              this.props.history.push({
                pathname: Constants.ALL_ROUTER.notSupport,
                state: { isIOS: true }
              })
            } else if (/android/i.test(navigator.userAgent)) {
              this.props.history.push({
                pathname: Constants.ALL_ROUTER.notSupport,
                state: { isIOS: false }
              })
            } else {
              this.props.history.push({
                pathname: Constants.ALL_ROUTER.notSupport,
                state: { isIOS: false }
              })
            }
          }
        };

      //get mediaDevices, only for（Firefox, Chrome, Opera）
      if (navigator.mediaDevices.getUserMedia) {
        //QQ browser do not support
        if (navigator.userAgent.indexOf('MQQBrowser') > -1) {
          alert("Sorry, your browser doesn't support this feature");
          return false;
        }

        navigator.mediaDevices.getUserMedia(videoObj)
          .then(function (stream) {
            const play = that.getViedoStream.bind(that, stream);
            play();
          })
          .catch(function (err) {
            MediaErr(err);
          });

      } else if (navigator.mediaDevices.webkitGetUserMedia) {
        navigator.webkitGetUserMedia(videoObj)
          .then(function (stream) {
            const play = that.getViedoStream.bind(that, stream);
            play();
          })
          .catch(function (err) {
            MediaErr(err);
          });
      } else if (navigator.mediaDevices.mozGetUserMedia) {
        navigator.mozGetUserMedia(videoObj)
          .then(function (stream) {
            const play = that.getViedoStream.bind(that, stream);
            play();
          })
          .catch(function (err) {
            MediaErr(err);
          });
      } else if (navigator.mediaDevices.msGetUserMedia) {
        navigator.msGetUserMedia(videoObj)
          .then(function (stream) {
            const play = that.getViedoStream.bind(that, stream);
            play();
          })
          .catch(function (err) {
            MediaErr(err);
          });
      } else {
        alert("Sorry, your browser doesn't support this feature");
        return false;
      }

    } catch (e) {
      if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
        this.props.history.push({
          pathname: Constants.ALL_ROUTER.notSupport,
          state: { isIOS: true }
        })
      } else if (/android/i.test(navigator.userAgent)) {
        this.props.history.push({
          pathname: Constants.ALL_ROUTER.notSupport,
          state: { isIOS: false }
        })
      } else {
        this.props.history.push({
          pathname: Constants.ALL_ROUTER.notSupport,
          state: { isIOS: false }
        })
      }
    }
  }

  getQRCode(video, canvas, context) {
    let timer = setInterval(function () {
      const imageWidth = video.videoWidth;
      const imageHeight = video.videoHeight;

      canvas.width = imageWidth;
      canvas.height = imageWidth;
      context.drawImage(video, 0, 0, imageWidth, imageHeight);

      let qr = new QrcodeDecoder();

      qr.decodeFromImage(canvas.toDataURL("image/png")).then((res) => {
        if (res.data) {
          processQR(res.data).then(() => {
            window.clearInterval(timer);
          })
        }
      });
    }, 300)
  }

  getViedoStream(stream) {
    this.setState({
      getPermission: true
    });
    let canvas = null, context = null, video = null;
    canvas = this.refs.canvas;
    context = canvas.getContext("2d");
    video = this.refs.video;
    video.srcObject = stream;
    video.onloadedmetadata = function (e) {
      video.play();
    };
    this.getQRCode(video, canvas, context);
  }

  render() {
    return (
      <div>
        <div id="contentHolder">
          <video className="viedo-player" ref="video" autoPlay playsInline></video>
          <canvas className="canvas-content" ref="canvas"></canvas>
          <div className="viedo-cover">
            <div className="qrcode">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          <br />
        </div>
      </div>
    );
  }
}

export default withRouter(Scanner);
