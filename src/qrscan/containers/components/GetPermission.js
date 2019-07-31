import React, { Component } from 'react';
import Constants from '../../Constants';
import { withRouter } from 'react-router-dom';

class GetPermission extends Component {
  componentWillMount() {
    let ua = navigator.userAgent.toLowerCase();
    console.log('changed');
    if (/(iphone|ipad|ipod|ios)/i.test(ua)) {
      console.log('ios')
      if (/chrome/i.test(ua)) {
        this.props.history.push({
          pathname: Constants.ALL_ROUTER.notSupport,
          state: { isIOS: true }
        })
      }
    }
  }

  render() {
    return (
      <div>
        <div className="content-contenter">
          <div className="content-header"></div>

          <div className="content-body text-center">
            <div className="content-body__img-content">
              <img className="content-body__logo-img" src="/img/beep-logo.png" alt="" />
              <br />
              <img className="content-body__qr-scanner-img" src="/img/beep-qrscan.png" alt="" />
            </div>
          </div>

          <div className="content-footer">
            <a className="text-center content-footer__button-fill content-footer__button-shadow content-footer__button-main" href={Constants.BASE_URL + Constants.ALL_ROUTER.scan}>
              SCAN QR CODE
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(GetPermission);
