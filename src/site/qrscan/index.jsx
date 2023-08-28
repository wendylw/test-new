import QrcodeDecoder from 'qrcode-decoder';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { IconLeftArrow } from '../../components/Icons';
import LogoImage from '../../images/qrscan-logo.png';
import Constants from '../../utils/constants';
import logger from '../../utils/monitoring/logger';
import prefetch from '../../common/utils/prefetch-assets';
import './index.scss';

const { ERROR, SCAN_NOT_SUPPORT } = Constants.ROUTER_PATHS;

// --Begin-- Hack MediaStream
// hacking codes, without this codes we are not able to close the camera
/* eslint-disable no-unused-vars */
let MediaStream = window.MediaStream;

if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
  MediaStream = window.webkitMediaStream;
}

// eslint-disable-next-line no-redeclare
/*global MediaStream:true */
if (typeof MediaStream !== 'undefined' && !('stop' in MediaStream.prototype)) {
  MediaStream.prototype.stop = function() {
    this.getTracks().forEach(function(track) {
      track.stop();
    });
  };
}
/* eslint-enable no-unused-vars */
// ---End--- Hack MediaStream

const processQR = qrData =>
  new Promise((resolve, reject) => {
    let data = qrData.trim();
    const source = encodeURIComponent(window.location.href);
    const extraParams = 'utm_source=beepit.co&utm_medium=web_scanner&utm_campaign=web_scanner';
    const domainRegex = /(http|https):\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g;

    if (/^https?:/.test(data)) {
      data += `${data.includes('?') ? '&' : '?'}source=${source}`;

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

class QRScan extends Component {
  videoRef = React.createRef();
  canvasRef = React.createRef();
  mediaStreamTrackList = [];
  show = true;
  timer = null;

  componentDidMount() {
    this.getCamera();
    prefetch(['SITE_HM'], ['SiteHome']);
  }

  componentWillUnmount() {
    this.mediaStreamTrackList.map(mediaStreamTrack => mediaStreamTrack && mediaStreamTrack.stop());
  }

  gotoNotSupport() {
    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
      this.props.history.replace({
        pathname: `${ERROR}${SCAN_NOT_SUPPORT}`,
        state: { isIOS: true },
      });
    } else if (/android/i.test(navigator.userAgent)) {
      this.props.history.replace({
        pathname: `${ERROR}${SCAN_NOT_SUPPORT}`,
        state: { isIOS: false },
      });
    } else {
      this.props.history.replace({
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
        MediaErr = error => {
          console.warn('[QRScan] getCamera failed:', error);
          logger.warn('Site_QRScan_GetCameraFailed', {
            message: error?.message,
          });
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
          .then(stream => {
            that.mediaStreamTrackList.push(typeof stream.stop === 'function' ? stream : stream.getTracks()[1]);
            this.getVideoStream(stream);
          })
          .catch(function(err) {
            MediaErr(err);
          });
      } else if (navigator.mediaDevices.webkitGetUserMedia) {
        navigator
          .webkitGetUserMedia(videoObj)
          .then(stream => {
            that.mediaStreamTrackList.push(typeof stream.stop === 'function' ? stream : stream.getTracks()[1]);
            this.getVideoStream(stream);
          })
          .catch(function(err) {
            MediaErr(err);
          });
      } else if (navigator.mediaDevices.mozGetUserMedia) {
        navigator
          .mozGetUserMedia(videoObj)
          .then(stream => {
            that.mediaStreamTrackList.push(typeof stream.stop === 'function' ? stream : stream.getTracks()[1]);
            this.getVideoStream(stream);
          })
          .catch(function(err) {
            MediaErr(err);
          });
      } else if (navigator.mediaDevices.msGetUserMedia) {
        navigator
          .msGetUserMedia(videoObj)
          .then(stream => {
            that.mediaStreamTrackList.push(typeof stream.stop === 'function' ? stream : stream.getTracks()[1]);
            this.getVideoStream(stream);
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
    this.timer = setInterval(function() {
      const imageWidth = video.videoWidth;
      const imageHeight = video.videoHeight;

      canvas.width = imageWidth;
      canvas.height = imageHeight;
      context.drawImage(video, 0, 0, imageWidth, imageHeight);

      let qr = new QrcodeDecoder();

      qr.decodeFromImage(canvas.toDataURL('image/png')).then(res => {
        if (res.data) {
          processQR(res.data).finally(() => {
            window.clearInterval(this.timer);
          });
        }
      });
    }, 300);
  }

  getVideoStream(stream) {
    this.setState({
      getPermission: true,
    });

    const canvas = this.canvasRef.current;
    const context = canvas.getContext('2d');
    let video = this.videoRef.current;

    video.srcObject = stream;
    video.onloadedmetadata = function(e) {
      video.play();
    };

    this.getQRCode(video, canvas, context);
  }

  backToPreviousPage = data => {
    const { history, location } = this.props;
    const pathname = (location.state && location.state.from && location.state.from.pathname) || '/home';

    history.push({
      pathname,
      state: {
        from: location,
        data,
      },
    });
  };

  handleBackClicked = () => {
    window.clearInterval(this.timer);
    this.backToPreviousPage();
  };

  render() {
    const { t } = this.props;
    const showMessage = !/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent);

    return (
      <main id="contentHolder" className="fixed-wrapper fixed-wrapper__main" data-test-id="site.scan.container">
        <header className="header flex flex-space-between flex-middle sticky-wrapper">
          <div>
            <IconLeftArrow
              className="icon icon__big icon__default text-middle"
              onClick={this.handleBackClicked}
              data-test-id="site.scan.back-btn"
            />
            <h2 className="header__title text-middle text-size-big text-weight-bolder text-omit__single-line">
              {t('ScanQRCode')}
            </h2>
          </div>
        </header>
        {!showMessage ? null : (
          <div className="qrscan__recommend top-message primary padding-normal text-center absolute-wrapper">
            <p className="top-message__text text-weight-bolder">{t('UseChromeMessage')}</p>
          </div>
        )}
        <video ref={this.videoRef} className="qrscan__video-player" autoPlay playsInline />
        <canvas ref={this.canvasRef} className="qrscan__canvas" />
        <section className="qrscan__cover">
          <img className="qrscan__logo" src={LogoImage} alt="" />
          <span className="qrscan__tips text-center">{t('ScanDescribeText')}</span>
          <div className="qrscan__qrcode">
            <div />
            <div />
            <div />
            <div />
          </div>
        </section>
      </main>
    );
  }
}
QRScan.displayName = 'QRScan';

export default withTranslation(['Scanner'])(QRScan);
