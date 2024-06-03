import React from 'react';
import PropTypes from 'prop-types';
import { getClassName } from '../../../../../common/utils/ui';
import styles from './Ticket.module.scss';

const Ticket = ({ className, leftContentClassName, rightContentClassName, leftContent, rightContent }) => (
  <div className={getClassName([styles.TicketContainer, className])}>
    <div className={styles.Ticket}>
      <div className={getClassName([styles.TicketLeft, leftContentClassName])}>{leftContent}</div>
      <div className={getClassName([styles.TicketRight, rightContentClassName])}>{rightContent}</div>
    </div>
  </div>
);

Ticket.displayName = 'Ticket';

Ticket.propTypes = {
  className: PropTypes.string,
  leftContentClassName: PropTypes.string,
  rightContentClassName: PropTypes.string,
  leftContent: PropTypes.node || PropTypes.string,
  rightContent: PropTypes.node || PropTypes.string,
};

Ticket.defaultProps = {
  className: null,
  leftContentClassName: null,
  rightContentClassName: null,
  leftContent: '',
  rightContent: '',
};

export default Ticket;
