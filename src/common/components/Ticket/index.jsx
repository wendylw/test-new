import React from 'react';
import PropTypes from 'prop-types';
import { getClassName } from '../../utils/ui';
import styles from './Ticket.module.scss';

const ORIENTATION = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
};

const Ticket = ({ className, ticketClassName, mainClassName, stubClassName, orientation, main, stub }) => (
  <div className={getClassName([styles.TicketContainer, className])}>
    <div
      className={getClassName([
        styles.Ticket,
        orientation === ORIENTATION.VERTICAL ? styles.TicketVertical : null,
        ticketClassName,
      ])}
    >
      <div className={getClassName([styles.TicketMain, mainClassName])}>{main}</div>
      <div className={getClassName([styles.TicketStub, stubClassName])}>{stub}</div>
    </div>
  </div>
);

Ticket.displayName = 'Ticket';

Ticket.propTypes = {
  className: PropTypes.string,
  ticketClassName: PropTypes.string,
  mainClassName: PropTypes.string,
  stubClassName: PropTypes.string,
  orientation: PropTypes.oneOf([ORIENTATION.HORIZONTAL, ORIENTATION.VERTICAL]),
  main: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  stub: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
};

Ticket.defaultProps = {
  className: null,
  ticketClassName: null,
  mainClassName: null,
  stubClassName: null,
  orientation: ORIENTATION.HORIZONTAL,
  main: '',
  stub: '',
};

export default Ticket;
