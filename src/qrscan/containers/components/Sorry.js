import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Constants from '../../Constants';

class Sorry extends Component {
  render() {
    let sorryText;
    const { t } = this.props;

    if (this.props.location.state) {
      if (this.props.location.state.isIOS) {
        sorryText = (
          <p i18nKey="SettingsHelper">
            Please open beepit.co in <span className="text-bold">Safari</span>
          </p>
        );
      } else {
        sorryText = (
          <p i18nKey="SettingsHelper">
            Please open beepit.co in <span className="text-bold">Google Chrome</span>
          </p>
        );
      }
    } else {
      this.props.history.push(Constants.ALL_ROUTER.permission);
    }

    return (
      <div>
        <div className="content-contenter">
          <div className="content-header"></div>

          <div className="content-body text-center">
            <div className="content-body__img-content">
              <img className="content-body__logo-img" src="/img/beep-warning.png" alt="" />
              <h2 className="content-body__body-title">{t('UnsupportedBrowser')}</h2>
              {sorryText}
            </div>
          </div>

          <div className="content-footer"></div>
        </div>
      </div>
    );
  }
}

export default withRouter(Sorry);
