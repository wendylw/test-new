import React, { Component } from 'react';
import Constants from '../../Constants';
import Message from './Message';
import { withRouter } from 'react-router-dom';

class GetPermission extends Component {
  render() {
    return (
      <div>
        <div className="content-contenter">
          <div className="content-header">
            <Message></Message>
          </div>

          <div className="content-body text-center">
            <div className="content-body__img-content">
              <img className="content-body__logo-img" src="/img/beep-logo.png" alt="" />
              <br />
              <img className="content-body__qr-scanner-img" src="/img/beep-qrscan.png" alt="" />
            </div>
          </div>

          <div className="content-footer">
            <a
              className="text-center content-footer__button-fill content-footer__button-shadow content-footer__button-main"
              href={Constants.BASE_URL + Constants.ALL_ROUTER.scan}
            >
              SCAN QR CODE
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(GetPermission);
