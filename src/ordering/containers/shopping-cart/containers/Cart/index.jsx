import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import PayLater from './PayLater';
import PayFirst from './PayFirst';
import { getBusinessInfo, getEnablePayLater } from '../../../../redux/modules/app';
import './OrderingCart.scss';

function Cart(props) {
  const { history, businessInfo, enablePayLater } = props;

  if (JSON.stringify(businessInfo) === '{}') {
    return null;
  }

  return enablePayLater ? <PayLater history={history} /> : <PayFirst history={history} />;
}

Cart.displayName = 'Cart';

Cart.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  businessInfo: PropTypes.object,
  enablePayLater: PropTypes.bool,
};

Cart.defaultProps = {
  businessInfo: {},
  enablePayLater: false,
};

export default connect(state => ({
  businessInfo: getBusinessInfo(state),
  enablePayLater: getEnablePayLater(state),
}))(Cart);
