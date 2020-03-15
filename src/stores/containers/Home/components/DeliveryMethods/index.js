import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Constants from '../../../../../utils/constants';
import { IconNext } from '../../../../../components/Icons';
import paymentBankingImage from '../../../../../images/payment-banking.png';
import paymentCreditImage from '../../../../../images/payment-credit.png';
import Header from '../../../../../components/Header';

const { PAYMENT_METHODS, ROUTER_PATHS } = Constants;
const METHODS_LIST = [
  {
    name: PAYMENT_METHODS.ONLINE_BANKING_PAY,
    logo: paymentBankingImage,
    labelKey: 'FoodDelivery',
    pathname: ROUTER_PATHS.ORDERING_ONLINE_BANKING_PAYMENT,
  },
  {
    name: PAYMENT_METHODS.CREDIT_CARD_PAY,
    logo: paymentCreditImage,
    labelKey: 'SelfPickup',
    pathname: ROUTER_PATHS.ORDERING_CREDIT_CARD_PAYMENT,
  },
];

class DeliveryMethods extends Component {
  setCurrentDelivery() {}

  render() {
    const { t } = this.props;

    return (
      <section className="delivery">
        <Header className="border__bottom-divider gray has-right" isPage={true} title={t('SelectYourPreference')} />
        <ul className="delivery__list">
          {METHODS_LIST.map(method => (
            <li
              key={method.name}
              className="delivery__item border__bottom-divider flex flex-middle flex-space-between"
              onClick={() => this.setCurrentDelivery(method.name)}
            >
              <figure className="delivery__image-container">
                <img src={method.logo} alt={t(method.labelKey)}></img>
              </figure>
              <label className="delivery__name font-weight-bold">{t(method.labelKey)}</label>
              <i className="delivery__next-icon">
                <IconNext />
              </i>
            </li>
          ))}
        </ul>
      </section>
    );
  }
}

DeliveryMethods.propTypes = {
  onSelect: PropTypes.func,
};

DeliveryMethods.defaultProps = {
  onSelect: () => {},
};

export default withTranslation()(DeliveryMethods);
