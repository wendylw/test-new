import React, { Component } from 'react';
import Constants from '../../Constants';
import Message from './Message';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import beepLogo from '../../../images/beep-logo.png';
import beepQrScanImage from '../../../images/beep-qrscan.png';

class GetPermission extends Component {
  render() {
    const { t } = this.props;

    return (
      <div data-heap-name="qrscan.common.get-permission.container">
        <div className="content-contenter">
          <div className="content-header">
            <Message />
          </div>

          <div className="content-body text-center">
            <div className="content-body__img-content">
              <img className="content-body__logo-img" src={beepLogo} alt="" />
              <br />
              <img className="content-body__qr-scanner-img" src={beepQrScanImage} alt="" />
            </div>
          </div>

          <div className="content-footer">
            <a
              className="text-center content-footer__button-fill content-footer__button-shadow content-footer__button-main"
              href={Constants.BASE_URL + Constants.ALL_ROUTER.scan}
              data-heap-name="qrscan.common.get-permission.scan-link"
            >
              {t('ScanQRCode')}
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(withTranslation('Scanner')(GetPermission));
