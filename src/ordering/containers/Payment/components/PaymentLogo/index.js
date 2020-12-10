import React from 'react';
import _get from 'lodash/get';
import paymentBankingImage from '../../../../../images/payment-banking.png';
import paymentCreditImage from '../../../../../images/payment-credit.png';
import paymentBoostImage from '../../../../../images/payment-boost.png';
import paymentGrabImage from '../../../../../images/payment-grab.png';
import paymentTNGImage from '../../../../../images/payment-tng.png';
import paymentGcashImage from '../../../../../images/payment-gcash.png';
import paymentLineImage from '../../../../../images/payment-line.png';

const imageMap = {
  paymentBankingImage,
  paymentCreditImage,
  paymentBoostImage,
  paymentGrabImage,
  paymentTNGImage,
  paymentGcashImage,
  paymentLineImage,
};

const getPaymentLogoByName = name => _get(imageMap, name, null);

const PaymentLogo = ({ payment }) => (
  <img className="ordering-payment__image" src={getPaymentLogoByName(payment.logo)} alt={payment.label} />
);

export default PaymentLogo;
