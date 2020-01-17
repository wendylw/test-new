import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

class Message extends Component {
  render() {
    const { t } = this.props;
    let showMessage = !/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent);

    return (
      <div>
        {showMessage ? (
          <div className="top-message primary fixed">
            <div className="top-message__text">{t('UseChromeMessage')}</div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default withTranslation('Scanner')(Message);
