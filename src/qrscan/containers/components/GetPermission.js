import React, { Component } from 'react';
import Constants from '../../Constants';

class GetPermission extends Component {
  render() {
    return (
      <div>
        <div className="content-contenter">
          <div className="content-header"></div>

          <div className="content-body text-center">
            <div className="img-content">
              <img className="logo-img" src="/img/beep-logo.png" alt="" />
              <br />
              <img className="qr-scanner-img" src="/img/beep-qrscan.png" alt="" />
            </div>
          </div>

          <div className="content-footer">
            <a className="text-center button-fill button-shadow button-main" href={Constants.ALL_ROUTER.scan}>
              SCAN QR CODE
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default GetPermission;
