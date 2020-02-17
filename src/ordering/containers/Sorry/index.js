import React, { Component } from 'react';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActionCreators } from '../../redux/modules/app';
import { actions as cartActionCreators, getPendingTransactionIds } from '../../redux/modules/cart';

class Sorry extends Component {
  async componentWillMount() {
    this.props.appActions.showMessageModal({
      message: 'Payment Failed',
      description: `We could not process your payment. The contents of your cart have been saved for you.`,
    });

    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_CART
    });
  }

  shouldComponentUpdate(nextProps) {
    return !!nextProps.order;
  }

  render() {
    return (
      <div className="loader theme page-loader"></div>
    );
  }
}

export default connect(
  state => ({
    pendingTransactionIds: getPendingTransactionIds(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActionCreators, dispatch),
    cartActions: bindActionCreators(cartActionCreators, dispatch),
  })
)(Sorry);
