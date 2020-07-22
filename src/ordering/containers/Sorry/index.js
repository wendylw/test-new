import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as appActionCreators } from '../../redux/modules/app';
import { actions as cartActionCreators, getPendingTransactionIds } from '../../redux/modules/cart';

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
    const description = this.getDescription();

    this.props.appActions.showMessageModal({
      message: t('PaymentFailed'),
      description: description,
    });

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
    return <div className="loader theme page-loader" data-heap-name="ordering.sorry.container"></div>;
  }
}

export default compose(
  withTranslation(),
  connect(
    state => ({
      pendingTransactionIds: getPendingTransactionIds(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      cartActions: bindActionCreators(cartActionCreators, dispatch),
    })
  )
)(Sorry);
