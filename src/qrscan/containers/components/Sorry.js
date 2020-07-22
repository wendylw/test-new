import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Trans, withTranslation } from 'react-i18next';
import Constants from '../../Constants';
import beepWarningImage from '../../../images/beep-warning.png';

class Sorry extends Component {
  render() {
    let sorryText;
    const { t } = this.props;

    if (this.props.location.state) {
      if (this.props.location.state.isIOS) {
        sorryText = (
          <Trans ns="Scanner" i18nKey="IosSorryText">
            <p>
              Please open beepit.com in <span className="text-bold">Safari</span>
            </p>
          </Trans>
        );
      } else {
        sorryText = (
          <Trans ns="Scanner" i18nKey="AndroidSorryText">
            <p>
              Please open beepit.com in <span className="text-bold">Google Chrome</span>
            </p>
          </Trans>
        );
      }
    } else {
      this.props.history.push(Constants.ALL_ROUTER.permission);
    }

    return (
      <div data-heap-name="qrscan.common.sorry.container">
        <div className="content-contenter">
          <div className="content-header"></div>

          <div className="content-body text-center">
            <div className="content-body__img-content">
              <img className="content-body__logo-img" src={beepWarningImage} alt="" />
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

export default withRouter(withTranslation('Scanner')(Sorry));
