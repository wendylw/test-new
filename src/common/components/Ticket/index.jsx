import React from 'react';
import PropTypes from 'prop-types';
import { getClassName } from '../../utils/ui';
import styles from './Ticket.module.scss';

const ORIENTATION = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
};

const SIZES = {
  normal: 'normal',
  large: 'large',
};

const Ticket = ({ className, mainClassName, stubClassName, orientation, size, showBorder, showShadow, main, stub }) => (
  <div
    className={getClassName([
      styles.Ticket,
      className,
      orientation,
      size,
      showBorder ? 'border' : null,
      showShadow ? 'shadow' : null,
    ])}
  >
    <div className={getClassName([styles.TicketMain, mainClassName])}>{main}</div>
    <div className={getClassName([styles.TicketStub, stubClassName])}>{stub}</div>
  </div>
);

Ticket.displayName = 'Ticket';

Ticket.propTypes = {
  className: PropTypes.string,
  mainClassName: PropTypes.string,
  stubClassName: PropTypes.string,
  orientation: PropTypes.oneOf(Object.values(ORIENTATION)),
  size: PropTypes.oneOf(Object.values(SIZES)),
  showBorder: PropTypes.bool,
  showShadow: PropTypes.bool,
  main: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  stub: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
};

Ticket.defaultProps = {
  className: null,
  mainClassName: null,
  stubClassName: null,
  orientation: ORIENTATION.HORIZONTAL,
  size: SIZES.normal,
  showBorder: true,
  showShadow: true,
  main: '',
  stub: '',
};

export default Ticket;
