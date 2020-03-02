import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as appActionCreators } from '../../redux/modules/app';
import { actions as cartActionCreators, getPendingTransactionIds } from '../../redux/modules/cart';

class Sorry extends Component {
  async componentDidMount() {
    const { t } = this.props;

    this.props.appActions.showMessageModal({
      message: t('PaymentFailed'),
      description: t('PaymentFailedDescription'),
    });

    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_CART,
    });
  }

  shouldComponentUpdate(nextProps) {
    return !!nextProps.order;
  }

  render() {
    return <div className="loader theme page-loader"></div>;
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
