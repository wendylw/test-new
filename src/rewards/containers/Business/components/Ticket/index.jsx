import React from 'react';
import PropTypes from 'prop-types';
import styles from './Ticket.module.scss';

const Ticket = ({ leftContent, rightContent }) => (
  <div className={styles.TicketContainer}>
    <div className={styles.Ticket}>
      <div className={styles.TicketLeft}>{leftContent}</div>
      <div className={styles.TicketRight}>{rightContent}</div>
    </div>
  </div>
);

Ticket.displayName = 'Ticket';

Ticket.propTypes = {
  leftContent: PropTypes.node || PropTypes.string,
  rightContent: PropTypes.node || PropTypes.string,
};

Ticket.defaultProps = {
  leftContent: '',
  rightContent: '',
};

export default Ticket;
