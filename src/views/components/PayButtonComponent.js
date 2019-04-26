import React, { Component } from 'react'
import PropTypes from 'prop-types'

class PayButtonComponent extends Component {
  static propTypes = {
    sessionId: PropTypes.string,
    orderStatus: PropTypes.string,
  }

  static defaultProps = {
    orderStatus: '',
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.orderStatus === 'pendingPayment') {
      // TODO: redirect to StoreHub Payment Center
      alert('TODO: redirect to StoreHub Payment Center');
    }
  }

  handleClick = () => {
    // TODO: create order
  };

  render() {
    const isOrderPendingPayment = (this.props.orderStatus === 'pendingPayment');
    const text = (isOrderPendingPayment ? 'Pay' : 'Redirecting..');

    return (
      <button onClick={this.handleClick} disabled={!isOrderPendingPayment}>{text}</button>
    )
  }
}

export default PayButtonComponent;
