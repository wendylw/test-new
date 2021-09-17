import React, { Component } from 'react';
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

    alert(this.getDescription(), { title: t('PaymentFailed') });

    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_CART,
      search: window.location.search,
    });
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

export default Sorry;
