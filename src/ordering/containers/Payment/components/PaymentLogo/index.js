import React from 'react';
import _get from 'lodash/get';
import paymentBankingImage from '../../../../../images/payment-banking.png';
import paymentCreditImage from '../../../../../images/payment-credit.png';
import paymentBoostImage from '../../../../../images/payment-boost.png';
import paymentGrabImage from '../../../../../images/payment-grab.png';
import paymentTNGImage from '../../../../../images/payment-tng.svg';
import paymentGcashImage from '../../../../../images/payment-gcash.png';

const imageMap = {
  paymentBankingImage,
  paymentCreditImage,
  paymentBoostImage,
  paymentGrabImage,
  paymentTNGImage,
  paymentGcashImage,
};

const getPaymentLogoByName = name => _get(imageMap, name, null);

const PaymentLogo = ({ payment }) => <img src={getPaymentLogoByName(payment.logo)} alt={payment.label} />;

export default PaymentLogo;
