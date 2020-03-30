import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import QrcodeDecoder from 'qrcode-decoder';
import Constants from '../../utils/constants';
import ShapeImage from '../../images/shape.png';
import './index.scss';

const { ERROR, SCAN_NOT_SUPPORT } = Constants;

const processQR = qrData =>
  new Promise((resolve, reject) => {
    let data = qrData.trim();

    if (/^https?:/.test(data)) {
      if (data.includes('beepit.co')) {
        const extraParams = 'utm_source=beepit.co&utm_medium=web_scanner&utm_campaign=web_scanner';
        data += `${data.includes('?') ? '&' : '?'}${extraParams}`;
      }

      window.location.href = data;

      resolve(data);
    } else {
      reject('Not Identified');
    }
  });

class QRScan extends Component {
  componentDidMount() {
    this.getCamera();
  }

  gotoNotSupport() {
    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
      this.props.history.push({
        pathname: `${ERROR}${SCAN_NOT_SUPPORT}`,
        state: { isIOS: true },
      });
    } else if (/android/i.test(navigator.userAgent)) {
      this.props.history.push({
        pathname: `${ERROR}${SCAN_NOT_SUPPORT}`,
        state: { isIOS: false },
      });
    } else {
      this.props.history.push({
        pathname: `${ERROR}${SCAN_NOT_SUPPORT}`,
        state: { isIOS: false },
      });
    }
  }

  getCamera() {
    const { t } = this.props;
    //turn on the camera
    try {
      const that = this;

      const videoObj = { video: { facingMode: 'environment' }, audio: false },
        MediaErr = function(error) {
          if (error.name !== 'NotAllowedError') {
            this.gotoNotSupport();
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
            const play = that.getVideoStream.bind(that, stream);
            play();
          })
          .catch(function(err) {
            MediaErr(err);
          });
      } else if (navigator.mediaDevices.webkitGetUserMedia) {
        navigator
          .webkitGetUserMedia(videoObj)
          .then(function(stream) {
            const play = that.getVideoStream.bind(that, stream);
            play();
          })
          .catch(function(err) {
            MediaErr(err);
          });
      } else if (navigator.mediaDevices.mozGetUserMedia) {
        navigator
          .mozGetUserMedia(videoObj)
          .then(function(stream) {
            const play = that.getVideoStream.bind(that, stream);
            play();
          })
          .catch(function(err) {
            MediaErr(err);
          });
      } else if (navigator.mediaDevices.msGetUserMedia) {
        navigator
          .msGetUserMedia(videoObj)
          .then(function(stream) {
            const play = that.getVideoStream.bind(that, stream);
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
      this.gotoNotSupport();
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
            window.clearInterval(timer);
          });
        }
      });
    }, 300);
  }

  getVideoStream(stream) {
    this.setState({
      getPermission: true,
    });

    const canvas = this.refs.canvas;
    const context = canvas.getContext('2d');
    let video = this.refs.video;

    video.srcObject = stream;
    video.onloadedmetadata = function(e) {
      video.play();
    };

    this.getQRCode(video, canvas, context);
  }

  render() {
    const { t } = this.props;
    const showMessage = !/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent);

    return (
      <main id="contentHolder" className="fixed-wrapper">
        {!showMessage ? null : (
          <div className="top-message primary padding-normal text-center absolute-wrapper">
            <p className="top-message__text text-weight-bold">{t('UseChromeMessage')}</p>
          </div>
        )}
        <video className="qrscan__video-player" ref="video" autoPlay playsInline></video>
        <canvas className="qrscan__canvas" ref="canvas"></canvas>
        <section className="qrscan__cover">
          <img className="qrscan__logo" src={ShapeImage} alt="" />
          <span className="qrscan__tips text-center">{t('ScanDescribeText')}</span>
          <div className="qrscan__qrcode">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </section>
      </main>
    );
  }
}

export default withTranslation(['Scanner'])(QRScan);
