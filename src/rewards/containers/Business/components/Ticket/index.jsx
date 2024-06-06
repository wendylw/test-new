import React from 'react';
import PropTypes from 'prop-types';
import { getClassName } from '../../../../../common/utils/ui';
import styles from './Ticket.module.scss';

const Ticket = ({ className, mainClassName, stubClassName, main, stub }) => (
  <div className={getClassName([styles.TicketContainer, className])}>
    <div className={styles.Ticket}>
      <div className={getClassName([styles.TicketMain, mainClassName])}>{main}</div>
      <div className={getClassName([styles.TicketStub, stubClassName])}>{stub}</div>
    </div>
  </div>
);

Ticket.displayName = 'Ticket';

Ticket.propTypes = {
  className: PropTypes.string,
  mainClassName: PropTypes.string,
  stubClassName: PropTypes.string,
  main: PropTypes.node || PropTypes.string,
  stub: PropTypes.node || PropTypes.string,
};

Ticket.defaultProps = {
  className: null,
  mainClassName: null,
  stubClassName: null,
  main: '',
  stub: '',
};

export default Ticket;
