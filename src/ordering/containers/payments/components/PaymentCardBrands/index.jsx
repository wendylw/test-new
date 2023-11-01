import React from 'react';
import PropTypes from 'prop-types';
import { getSupportCreditCardBrands } from '../../utils';
import { VENDOR_STRIPE } from '../../utils/constants';
import paymentVisaImage from '../../../../../images/payment-visa.svg';
import paymentMasterImage from '../../../../../images/payment-mastercard.svg';
import paymentJCBImage from '../../../../../images/payment-JCB.svg';
import Constants from '../../../../../utils/constants';

const { CREDIT_CARD_BRANDS } = Constants;

const mapBrandToStandard = (brand, vendor) => {
  if (vendor === VENDOR_STRIPE) {
    // Referer: https://stripe.com/docs/js/element/events/on_change?type=cardElement
    // Card brand. Can be American Express, Diners Club, Discover, JCB, MasterCard, UnionPay, Visa, or Unknown.
    // The card brand of the card number being entered.
    // Can be one of visa, mastercard, amex, discover, diners, jcb, unionpay, or unknown.
    switch (brand) {
      case 'visa':
        return CREDIT_CARD_BRANDS.VISA;
      case 'mastercard':
        return CREDIT_CARD_BRANDS.MASTER_CARD;
      case 'amex':
        return CREDIT_CARD_BRANDS.AMEX;
      case 'discover':
        return CREDIT_CARD_BRANDS.DISCOVER;
      case 'diners':
        return CREDIT_CARD_BRANDS.DINERS;
      case 'jcb':
        return CREDIT_CARD_BRANDS.JCB;
      case 'unionpay':
        return CREDIT_CARD_BRANDS.UNION_PAY;
      case 'unknown':
      default:
        return CREDIT_CARD_BRANDS.UNKNOWN;
    }
  }

  return brand;
};

/* eslint-disable jsx-a11y/alt-text */
const PaymentCardBrands = ({ country, brand: originalBrand, vendor = '' }) => {
  const brandsSupported = getSupportCreditCardBrands(country);
  const brand = mapBrandToStandard(originalBrand, vendor);

  return (
    <div className="payment-credit-card__icon-container padding-left-right-small">
      {brandsSupported.includes(CREDIT_CARD_BRANDS.VISA) ? (
        <i
          className={`payment-credit-card__icon text-middle margin-smaller text-size-reset ${
            brand === CREDIT_CARD_BRANDS.VISA ? 'active' : ''
          }`}
        >
          <img src={paymentVisaImage} />
        </i>
      ) : null}

      {brandsSupported.includes(CREDIT_CARD_BRANDS.MASTER_CARD) ? (
        <i
          className={`payment-credit-card__icon text-middle margin-smaller text-size-reset ${
            brand === CREDIT_CARD_BRANDS.MASTER_CARD ? 'active' : ''
          }`}
        >
          <img src={paymentMasterImage} />
        </i>
      ) : null}

      {brandsSupported.includes(CREDIT_CARD_BRANDS.JCB) ? (
        <i
          className={`payment-credit-card__icon text-middle margin-smaller text-size-reset ${
            brand === CREDIT_CARD_BRANDS.JCB ? 'active' : ''
          }`}
        >
          <img src={paymentJCBImage} />
        </i>
      ) : null}
    </div>
  );
};

PaymentCardBrands.displayName = 'PaymentCardBrands';
/* eslint-enable jsx-a11y/alt-text */

PaymentCardBrands.propTypes = {
  brand: PropTypes.string,
  vendor: PropTypes.string,
  country: PropTypes.string,
};

PaymentCardBrands.defaultProps = {
  brand: '',
  vendor: '',
  country: '',
};

export default PaymentCardBrands;
