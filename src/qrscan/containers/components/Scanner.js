import React, { Component } from 'react';
import QrcodeDecoder from 'qrcode-decoder';
import Message from './Message';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import Constants from '../../Constants';
import shapeImage from '../../../images/shape.png';

const processQR = qrData =>
  new Promise((resolve, reject) => {
    let data = qrData.trim();
    const extraParams = 'utm_source=beepit.co&utm_medium=web_scanner&utm_campaign=web_scanner';
    const domainRegex = /(http|https):\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g;

    if (/^https?:/.test(data)) {
      if (data.includes('tableId=DEMO')) {
        data = data.match(domainRegex)[0];
      } else if (data.includes('beepit.co') || data.includes('beepit.com')) {
        data += `${data.includes('?') ? '&' : '?'}${extraParams}`;
      }
      window.location.href = data;
      resolve(data);
    } else {
      reject('Not Identified');
    }
  });

class Scanner extends Component {
  componentDidMount() {
    this.getCamera();
  }

  getCamera() {
    const { t } = this.props;
    //turn on the camera
    try {
      let that = this;

      const videoObj = { video: { facingMode: 'environment' }, audio: false },
        MediaErr = function(error) {
          if (error.name === 'NotAllowedError') {
            that.props.history.push(Constants.ALL_ROUTER.permission);
          } else {
            if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
              this.props.history.push({
                pathname: Constants.ALL_ROUTER.notSupport,
                state: { isIOS: true },
              });
            } else if (/android/i.test(navigator.userAgent)) {
              this.props.history.push({
                pathname: Constants.ALL_ROUTER.notSupport,
                state: { isIOS: false },
              });
            } else {
              this.props.history.push({
                pathname: Constants.ALL_ROUTER.notSupport,
                state: { isIOS: false },
              });
            }
          }
        };

      //get mediaDevices, only for（Firefox, Chrome, Opera）
      if (navigator.mediaDevices.getUserMedia) {
        //QQ browser do not support
        if (navigator.userAgent.indexOf('MQQBrowser') > -1) {
          MediaErr('Browser error');
          return false;
        }

        navigator.mediaDevices
          .getUserMedia(videoObj)
          .then(function(stream) {
            const play = that.getViedoStream.bind(that, stream);
            play();
          })
          .catch(function(err) {
            MediaErr(err);
          });
      } else if (navigator.mediaDevices.webkitGetUserMedia) {
        navigator
          .webkitGetUserMedia(videoObj)
          .then(function(stream) {
            const play = that.getViedoStream.bind(that, stream);
            play();
          })
          .catch(function(err) {
            MediaErr(err);
          });
      } else if (navigator.mediaDevices.mozGetUserMedia) {
        navigator
          .mozGetUserMedia(videoObj)
          .then(function(stream) {
            const play = that.getViedoStream.bind(that, stream);
            play();
          })
          .catch(function(err) {
            MediaErr(err);
          });
      } else if (navigator.mediaDevices.msGetUserMedia) {
        navigator
          .msGetUserMedia(videoObj)
          .then(function(stream) {
            const play = that.getViedoStream.bind(that, stream);
            play();
          })
          .catch(function(err) {
            MediaErr(err);
          });
      } else {
        alert(t('ScannerSorryText'));
        return false;
      }
    } catch (e) {
      if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
        this.props.history.push({
          pathname: Constants.ALL_ROUTER.notSupport,
          state: { isIOS: true },
        });
      } else if (/android/i.test(navigator.userAgent)) {
        this.props.history.push({
          pathname: Constants.ALL_ROUTER.notSupport,
          state: { isIOS: false },
        });
      } else {
        this.props.history.push({
          pathname: Constants.ALL_ROUTER.notSupport,
          state: { isIOS: false },
        });
      }
    }
  }

  getQRCode(video, canvas, context) {
    let timer = setInterval(function() {
      const imageWidth = video.videoWidth;
      const imageHeight = video.videoHeight;

      canvas.width = imageWidth;
      canvas.height = imageHeight;
      context.drawImage(video, 0, 0, imageWidth, imageHeight);

      let qr = new QrcodeDecoder();

      qr.decodeFromImage(canvas.toDataURL('image/png')).then(res => {
        if (res.data) {
          processQR(res.data).then(() => {
            window.heap?.track('qrscan.common.scanner.qr-scanned');
            window.clearInterval(timer);
          });
        }
      });
    }, 300);
  }

  getViedoStream(stream) {
    this.setState({
      getPermission: true,
    });
    let canvas = null,
      context = null,
      video = null;
    canvas = this.refs.canvas;
    context = canvas.getContext('2d');
    video = this.refs.video;
    video.srcObject = stream;
    video.onloadedmetadata = function(e) {
      video.play();
    };
    this.getQRCode(video, canvas, context);
  }

  render() {
    const { t } = this.props;

    return (
      <div data-heap-name="qrscan.common.scanner.container">
        <div id="contentHolder">
          <Message />
          <video className="viedo-player" ref="video" autoPlay playsInline></video>
          <canvas className="canvas-content" ref="canvas"></canvas>
          <div className="viedo-cover">
            <img className="viedo-cover__logo" src={shapeImage} alt="" />
            <span className="viedo-cover__tips">{t('ScanDescribeText')}</span>
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

export default withRouter(withTranslation('Scanner')(Scanner));
