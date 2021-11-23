import React, { Component } from 'react';
import { connect } from 'react-redux';
import PayLater from './PayLater';
import PayFirst from './PayFirst';
import { getEnablePayLater } from '../../../../redux/modules/app';
import './OrderingCart.scss';

class Cart extends Component {
  render() {
    const { history, enablePayLater } = this.props;
    return <>{!enablePayLater ? <PayFirst history={history} /> : <PayLater history={history} />}</>;
  }
}

Cart.displayName = 'Cart';

export default connect(state => ({
  enablePayLater: getEnablePayLater(state),
}))(Cart);
