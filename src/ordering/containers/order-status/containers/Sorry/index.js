import React, { Component } from 'react';
import qs from 'qs';
import _pick from 'lodash/pick';
import { withTranslation } from 'react-i18next';
import Constants from '../../../../../utils/constants';
import Utils from '../../../../../utils/utils';
import { alert } from '../../../../../common/feedback';

const PROVIDER_TO_METHOD = {
  StripeFPX: 'onlineBanking',
  CCPPMYCreditCard: 'creditCard',
  GrabPay: 'onlineBanking',
  CCPPTnGPay: 'onlineBanking',
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

    alert(this.getDescription(), { title: t('PaymentFailed') });

    // for pay later order, the page will redirect to Table Summary
    if (queryParams.isPayLater === 'true') {
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

  shouldComponentUpdate(nextProps) {
    return !!nextProps.order;
  }

  render() {
    return <div className="loader theme full-page" data-heap-name="ordering.sorry.container"></div>;
  }
}
Sorry.displayName = 'OrderingSorry';

export default withTranslation()(Sorry);
