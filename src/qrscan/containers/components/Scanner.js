import React, { Component } from 'react';
import QrcodeDecoder from 'qrcode-decoder';

const processQR = (qrData) => new Promise((resolve, reject) => {
  if(/^https?:/.test(qrData)) {
   window.location.href = qrData;
   resolve(qrData)
  } else {
   reject('Not Identified') 
  }
})

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
      let videoObj = { video: true, audio: false },
        MediaErr = function (error) {
          if (error.PERMISSION_DENIED) {
            alert('You denied the camera permission');
          } else if (error.NOT_SUPPORTED_ERROR) {
            alert("Sorry, your browser doesn't support this feature");
          } else if (error.MANDATORY_UNSATISFIED_ERROR) {
            alert('Did not get the media stream');
          } else {
            console.log(error);
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
            let play = that.getViedoStream.bind(that,stream);
            play();
          })
          .catch(function (err) {
            MediaErr(err);
          });

      } else if (navigator.mediaDevices.webkitGetUserMedia) {
        navigator.webkitGetUserMedia(videoObj)
          .then(function (stream) {
            let play = that.getViedoStream.bind(that,stream);
            play();
          })
          .catch(function (err) {
            MediaErr(err);
          });
      } else if (navigator.mediaDevices.mozGetUserMedia) {
        navigator.mozGetUserMedia(videoObj)
          .then(function (stream) {
            let play = that.getViedoStream.bind(that,stream);
            play();
          })
          .catch(function (err) {
            MediaErr(err);
          });
      } else if (navigator.mediaDevices.msGetUserMedia) {
        navigator.msGetUserMedia(videoObj)
          .then(function (stream) {
            let play = that.getViedoStream.bind(that,stream);
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
      alert('Not support');
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
    }, 1000)
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
    let main = null;
    if (this.state.getPermission) {
      main =
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