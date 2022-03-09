import React from 'react';
import PropTypes from 'prop-types';
import styles from './PageFooter.module.scss';
import frameStyles from '../Frame/Frame.module.scss';
import { useSpaceOccupationAdjustment } from '../SpaceOccupationContext';

const PageFooter = props => {
  const { children, className, style, zIndex } = props;
  const ref = useSpaceOccupationAdjustment();
  return (
    <div
      ref={ref}
      className={`${frameStyles.fixedContent} body-scroll-block-fix ${frameStyles.footer} ${styles.footer} ${className}`}
      style={{ zIndex, ...style }}
    >
      {children}
    </div>
  );
};

PageFooter.displayName = 'PageFooter';

PageFooter.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  zIndex: PropTypes.number,
};

PageFooter.defaultProps = {
  children: null,
  className: '',
  style: {},
  zIndex: undefined,
};

export default PageFooter;
