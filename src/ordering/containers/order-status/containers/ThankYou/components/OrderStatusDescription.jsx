import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import beepOrderStatusAccepted from '../../../../../../../images/order-status-accepted.gif';
import beepOrderStatusCancelled from '../../../../../../images/order-status-cancelled.png';
import beepOrderStatusConfirmed from '../../../../../../images/order-status-confirmed.gif';
import beepOrderStatusDelivered from '../../../../../../images/order-status-delivered.gif';
import beepOrderStatusPaid from '../../../../../../images/order-status-paid.gif';
import beepOrderStatusPickedUp from '../../../../../../images/order-status-pickedup.gif';
import cashbackSuccessImage from '../../../../../../images/succeed-animation.gif';
import beepPreOrderSuccessImage from '../../../../../../images/beep-pre-order-success.png';

export class OrderStatusDescription extends React.Component {
  render() {
    return (
      <React.Fragment>
        <img
          className="ordering-thanks__image padding-normal margin-small"
          src={currentStatusObj.bannerImage}
          alt="Beep Success"
        />
      </React.Fragment>
    );
  }
}

OrderStatusDescription.propTypes = {
  className: PropTypes.string,
};

OrderStatusDescription.defaultProps = {};

export default compose(withTranslation('OrderingThankYou'))(OrderStatusDescription);
