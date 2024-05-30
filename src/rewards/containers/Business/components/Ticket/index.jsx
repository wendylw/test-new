import React from 'react';
import styles from './Ticket.module.scss';

const Ticket = () => (
  <div className={styles.TicketContainer}>
    <div className={styles.Ticket}>
      <div className={styles.TicketLeft}>test</div>
      <div className={styles.TicketRight}>test</div>
    </div>
  </div>
);

Ticket.displayName = 'Ticket';

export default Ticket;
