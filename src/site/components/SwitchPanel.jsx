import React from 'react';
import { withTranslation } from 'react-i18next';
import './SwitchPanel.scss';

class SwitchPanel extends React.Component {
  render() {
    const { t, shippingType, className, dataHeapName, handleSwitchTab } = this.props;

    const classList = [
      'switch-bar text-center tw-text-lg tw-leading-relaxed tw-font-bold sm:tw-pt-8px tw-pt-8 sm:tw-pb-12px tw-pb-12',
    ];

    if (className) {
      classList.push(className);
    }

    return (
      <ul className="header flex flex-space-around border__bottom-divider sticky-wrapper">
        <li
          className={`${classList.join(' ')} ${
            shippingType === 'delivery' ? 'switch-bar__active' : 'tw-text-gray-600'
          }`}
          data-testid="switchBar"
          data-heap-name={dataHeapName}
          data-heap-delivery-type="delivery"
          onClick={() => handleSwitchTab('delivery')}
        >
          {t('Delivery')}
        </li>
        <li
          className={`${classList.join(' ')} ${shippingType === 'pickup' ? 'switch-bar__active' : 'tw-text-gray-600'}`}
          data-heap-name={dataHeapName}
          data-heap-delivery-type="pickup"
          onClick={() => handleSwitchTab('pickup')}
        >
          {t('SelfPickup')}
        </li>
      </ul>
    );
  }
}
SwitchPanel.displayName = 'SwitchPanel';

export default withTranslation()(SwitchPanel);
