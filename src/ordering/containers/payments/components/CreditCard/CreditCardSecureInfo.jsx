import React from 'react';
import _get from 'lodash/get';
import { useTranslation, Trans } from 'react-i18next';
import AdyenSecurity from '../../../../../../src/images/Adyen-PCI.png';
import Constants from '../../../../../utils/constants';

const { PAYMENT_PROVIDERS } = Constants;
const KNOW_MORE_LINKS = {
  [PAYMENT_PROVIDERS.ADYEN]: 'https://www.adyen.com/platform/certifications',
  [PAYMENT_PROVIDERS.STRIPE]: 'https://stripe.com/docs/security/stripe',
};

function CreditCardSecureInfo(props) {
  const { paymentProvider } = props;
  const { t } = useTranslation('OrderingPayment');
  const knowMoreLink = _get(KNOW_MORE_LINKS, paymentProvider, '');

  return (
    <div className="payment-credit-card__secure padding-top-bottom-normal">
      <div className="padding-top-bottom-small">
        <label className="text-size-bigger text-weight-bolder">{t('SecurePaymentBy')}</label>
      </div>
      <div className="text-line-height-normal payment-credit-card__save-text flex flex-top flex-space-between">
        <img src={AdyenSecurity} alt="pci" className="payment-credit-card__secure-image margin-top-bottom-smaller" />
        <p className="payment-credit-card__secure-text">
          <Trans t={t} i18nKey="SecurityHint">
            Our card payment service is under PCI compliance protection to protect and encrypt cardholder data
            transmissions.
            {knowMoreLink && (
              <a
                className="payment-credit-card__link button button__link button__default text-weight-bolder"
                target="_blank"
                rel="noopener noreferrer"
                href={knowMoreLink}
              >
                Know more here
              </a>
            )}
          </Trans>
        </p>
      </div>
    </div>
  );
}
CreditCardSecureInfo.displayName = 'CreditCardSecureInfo';

export default CreditCardSecureInfo;
