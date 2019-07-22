import React, { Component } from 'react';
import QrcodeDecoder from 'qrcode-decoder';

class Scanner extends Component {
  state = {
    getPermission: false
  }

  componentDidMount() {
    this.getCamera();
  }

  getCamera() {
    //turn on the camera
    try {
      var videoObj = { video: true, audio: false },
        MediaErr = function (error) {
          if (error.PERMISSION_DENIED) {
            alert('You denied the camera permission');
          } else if (error.NOT_SUPPORTED_ERROR) {
            alert("Sorry, your browser doesn't support this feature");
          } else if (error.MANDATORY_UNSATISFIED_ERROR) {
            alert('Did not get the media stream');
          } else {
            alert('Please make sure you have a camera');
          }
        };

      let that = this;
      //get mediaDevices, only for（Firefox, Chrome, Opera）
      if (navigator.mediaDevices.getUserMedia) {
        //QQ browser do not support
        if (navigator.userAgent.indexOf('MQQBrowser') > -1) {
          alert("Sorry, your browser doesn't support this feature");
          return false;
        }

        navigator.mediaDevices.getUserMedia(videoObj)
          .then(function (stream) {
            that.setState({
              getPermission: true
            });
            let canvas = null, context = null, video = null;
            canvas = document.getElementById("canvas");
            context = canvas.getContext("2d");
            video = document.getElementById("video");
            video.srcObject = stream;
            video.onloadedmetadata = function (e) {
              video.play();
            };
            that.getQRCode(video, canvas, context);
          })
          .catch(function (err) {
            MediaErr(err);
          });

      } else if (navigator.mediaDevices.webkitGetUserMedia) {
        navigator.webkitGetUserMedia(videoObj)
          .then(function (stream) {
            that.setState({
              getPermission: true
            });
            let canvas = null, context = null, video = null;
            canvas = document.getElementById("canvas");
            context = canvas.getContext("2d");
            video = document.getElementById("video");
            video.srcObject = stream;
            video.onloadedmetadata = function (e) {
              video.play();
            };
            that.getQRCode(video, canvas, context);
          })
          .catch(function (err) {
            MediaErr(err);
          });
      } else if (navigator.mediaDevices.mozGetUserMedia) {
        navigator.mozGetUserMedia(videoObj)
          .then(function (stream) {
            that.setState({
              getPermission: true
            });
            let canvas = null, context = null, video = null;
            canvas = document.getElementById("canvas");
            context = canvas.getContext("2d");
            video = document.getElementById("video");
            video.srcObject = stream;
            video.onloadedmetadata = function (e) {
              video.play();
            };
            that.getQRCode(video, canvas, context);
          })
          .catch(function (err) {
            MediaErr(err);
          });
      } else if (navigator.mediaDevices.msGetUserMedia) {
        navigator.msGetUserMedia(videoObj)
          .then(function (stream) {
            that.setState({
              getPermission: true
            });
            let canvas = null, context = null, video = null;
            canvas = document.getElementById("canvas");
            context = canvas.getContext("2d");
            video = document.getElementById("video");
            video.srcObject = stream;
            video.onloadedmetadata = function (e) {
              video.play();
            };
            that.getQRCode(video, canvas, context);
          })
          .catch(function (err) {
            MediaErr(err);
          });
      } else {
        alert("Sorry, your browser doesn't support this feature");
        return false;
      }

    } catch (e) {
      alert('Not support');
    }
  }

  getQRCode(video, canvas, context) {
    let QRgetter = setInterval(function () {
      const imageWidth = video.videoWidth;
      const imageHeight = video.videoHeight;

      canvas.width = imageWidth;
      canvas.height = imageWidth;
      context.drawImage(video, 0, 0, imageWidth, imageHeight);

      let qr = new QrcodeDecoder();

      qr.decodeFromImage(canvas.toDataURL("image/png")).then((res) => {
        if (res.data) {
          console.log(res.data);
          window.clearInterval(QRgetter);
          window.location.href = res.data;
        }
      });
    }, 1000)
  }

  render() {
    let main = null;
    if (this.state.getPermission) {
      main =
        <div id="contentHolder">
          <video className="viedo-player" id="video" autoPlay playsInline></video>
          <canvas className="canvas-content" id="canvas"></canvas>
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
    } else {
      main =
        <div className="content-contenter">
          <div className="content-header">

          </div>

          <div className="content-body text-center">
            <div>
              Beep
            </div>
          </div>

          <div className="content-footer">
            <button className="text-center button-fill button-shadow button-main" onClick={this.getCamera}>
              SCAN QR CODE
            </button>
          </div>
        </div>
    }

    return (
      <div>
        {main}
      </div>
    );
  }
}

export default Scanner;
