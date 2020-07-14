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
    const { errorCode, provider } = params || {};
    const { t } = this.props;
    const errors = {
      AmountTooLarge: t('AmountTooLarge'),
      AmountTooSmall: t('AmountTooSmall'),
      AuthenticationRequired: t('AuthenticationRequired'),
      BalanceInsufficient: t('BalanceInsufficient'),
      CardExpired: t('CardExpired'),
      BankDeclined: t('BankDeclined'),
      IncorrectCvc: t('IncorrectCvc'),
      UnknownError: t('UnknownError'),
    };
    const methods = {
      onlineBanking: t('Online Banking'),
      creditCard: t('Credit/Debit Card'),
    };
    const provideMethod = PROVIDER_TO_METHOD[provider];
    return errorCode && provider
      ? t('Description', { paymentMethod: methods[provideMethod], error: errors[errorCode] })
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
