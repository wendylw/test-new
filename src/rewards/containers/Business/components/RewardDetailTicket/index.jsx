import React from 'react';
import PropTypes from 'prop-types';
import styles from './RewardDetailTicket.module.scss';

const RewardDetailTicket = ({ discount, discountText, name, stub }) => (
  <div className={styles.RewardDetailTicketTicket}>
    <div className={styles.RewardDetailTicketTicketMain}>
      <data className={styles.RewardDetailTicketDiscountValue} value={discount}>
        {discountText}
      </data>
      <h2 className={styles.RewardDetailTicketName}>{name}</h2>
    </div>

    <div className={styles.RewardDetailTicketTicketStub}>{stub}</div>
  </div>
);

RewardDetailTicket.displayName = 'RewardDetailTicket';

RewardDetailTicket.propTypes = {
  discount: PropTypes.string,
  discountText: PropTypes.string,
  name: PropTypes.string,
  stub: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
};

RewardDetailTicket.defaultProps = {
  discount: null,
  discountText: null,
  name: null,
  stub: '',
};

export default RewardDetailTicket;
