import React from 'react';
import _get from 'lodash/get';
import PropTypes from 'prop-types';
// GetzPay reuses Online Banking Image
// WB-4764 [FE] Add a new payment option 'Pay Online' (GetzPay)
import paymentBankingImage from '../../../../images/payment-banking.png';
import paymentCreditImage from '../../../../images/payment-credit.png';
import paymentBoostImage from '../../../../images/payment-boost.png';
import paymentGrabImage from '../../../../images/payment-grab.png';
import paymentTNGImage from '../../../../images/payment-tng.png';
import paymentGcashImage from '../../../../images/payment-gcash.png';
import paymentLineImage from '../../../../images/payment-line.png';
import paymentPayByCashImage from '../../../../images/payment-pay-by-cash.png';
import paymentApplePay from '../../../../images/payment-apple-pay.png';

const imageMap = {
  paymentBankingImage,
  paymentCreditImage,
  paymentBoostImage,
  paymentGrabImage,
  paymentTNGImage,
  paymentGcashImage,
  paymentLineImage,
  paymentPayByCashImage,
  paymentApplePay,
};

const PaymentLogo = ({ logo, alt }) => (
  <img className="ordering-payment__image" src={_get(imageMap, logo, null)} alt={alt} />
);

PaymentLogo.displayName = 'PaymentLogo';

PaymentLogo.propTypes = {
  logo: PropTypes.string,
  alt: PropTypes.string,
};

PaymentLogo.defaultProps = {
  logo: '',
  alt: '',
};

export default PaymentLogo;
