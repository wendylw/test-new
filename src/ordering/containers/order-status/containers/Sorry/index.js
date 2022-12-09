import React, { Component } from 'react';
import qs from 'qs';
import _pick from 'lodash/pick';
import { withTranslation } from 'react-i18next';
import prefetch from '../../../../../common/utils/prefetch-assets';
import Constants from '../../../../../utils/constants';
import Utils from '../../../../../utils/utils';
import { alert } from '../../../../../common/feedback';

const PROVIDER_TO_METHOD = {
  StripeFPX: 'onlineBanking',
  CCPPMYCreditCard: 'creditCard',
  GrabPay: 'onlineBanking',
  TnGOnline: 'onlineBanking',
  Boost: 'onlineBanking',
  BeepTHOnlineBanking: 'onlineBanking',
  BeepTHCreditCard: 'creditCard',
  BeepTHLinePay: 'onlineBanking',
  BeepPHCreditCard: 'creditCard',
  BeepPHCCPPGcash: 'onlineBanking',
};

class Sorry extends Component {
  async componentDidMount() {
    const { t } = this.props;
    const queryParams = Utils.getQueryString();
    const isPayLater = queryParams.isPayLater === 'true';
    const errorDescription = isPayLater ? this.getDescriptionOfPayLater() : this.getDescription();

    alert(errorDescription, { title: t('PaymentFailed') });

    // for pay later order, the page will redirect to Table Summary
    if (isPayLater) {
      const queryObject = _pick(queryParams, ['h', 'type', 'receiptNumber']);

      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_TABLE_SUMMARY,
        search: qs.stringify(queryObject, {
          addQueryPrefix: true,
        }),
      });
    } else {
      const queryObject = _pick(queryParams, ['h', 'type']);

      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_CART,
        search: qs.stringify(queryObject, {
          addQueryPrefix: true,
        }),
      });
    }

    prefetch(['ORD_MNU', 'ORD_SC'], ['OrderingDelivery', 'OrderingCart']);
  }

  getDescription = () => {
    const params = Utils.getQueryString();
    const { errorCode, paymentProvider } = params || {};
    const { t } = this.props;

    const methods = {
      onlineBanking: t('OnlineBanking'),
      creditCard: t('CreditAndDebitCard'),
    };
    const provideMethod = PROVIDER_TO_METHOD[paymentProvider];

    return errorCode && paymentProvider
      ? t('Description', { paymentMethod: methods[provideMethod], error: t(errorCode) })
      : t('PaymentFailedDescription');
  };

  getDescriptionOfPayLater = () => {
    const params = Utils.getQueryString();
    const { errorCode, paymentProvider } = params || {};
    const { t } = this.props;

    if (errorCode && paymentProvider) {
      const methods = {
        onlineBanking: t('OnlineBanking'),
        creditCard: t('CreditAndDebitCard'),
      };

      const provideMethod = PROVIDER_TO_METHOD[paymentProvider];

      return t('SpecificPaymentFailedDescriptionOfPayLater', {
        paymentMethod: methods[provideMethod],
        error: t(errorCode),
      });
    }

    return t('GeneralPaymentFailedDescriptionOfPayLater');
  };

  shouldComponentUpdate(nextProps) {
    return !!nextProps.order;
  }

  render() {
    return <div className="loader theme full-page" data-heap-name="ordering.sorry.container"></div>;
  }
}
Sorry.displayName = 'OrderingSorry';

export default withTranslation()(Sorry);
