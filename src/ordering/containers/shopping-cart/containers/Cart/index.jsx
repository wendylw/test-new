import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import PayLater from './PayLater';
import PayFirst from './PayFirst';
import { getEnablePayLater } from '../../../../redux/modules/app';
import './OrderingCart.scss';

function Cart(props) {
  const { history, enablePayLater } = props;

  return enablePayLater ? <PayLater history={history} /> : <PayFirst history={history} />;
}

Cart.displayName = 'Cart';

Cart.propTypes = {
  enablePayLater: PropTypes.bool,
};

Cart.defaultProps = {
  enablePayLater: false,
};

export default connect(state => ({
  enablePayLater: getEnablePayLater(state),
}))(Cart);
