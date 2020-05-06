import React from 'react';
import { withTranslation } from 'react-i18next';
import './SwitchPanel.scss';

class SwitchPanel extends React.Component {
  render() {
    const { t, shippingType, handleSwitchTab } = this.props;
    const classList = 'switch-bar text-center text-weight-bolder padding-top-bottom-normal';
    return (
      <ul className="header flex flex-space-around text-uppercase border__bottom-divider sticky-wrapper">
        <li
          className={`${classList} ${shippingType === 'delivery' ? 'switch-bar__active' : 'text-opacity'}`}
          onClick={() => handleSwitchTab('delivery')}
        >
          {t('Delivery')}
        </li>
        <li
          className={`${classList} ${shippingType === 'pickup' ? 'switch-bar__active' : 'text-opacity'}`}
          onClick={() => handleSwitchTab('pickup')}
        >
          {t('SelfPickup')}
        </li>
      </ul>
    );
  }
}

export default withTranslation()(SwitchPanel);
