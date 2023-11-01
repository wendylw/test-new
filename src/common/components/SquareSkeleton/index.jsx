import React from 'react';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';

const SquareSkeleton = ({ className, wrapperClassName, containerClassName, style }) => (
  <div className={wrapperClassName}>
    <div className="tw-pointer-events-none" style={{ paddingTop: '100%' }} />
    <Skeleton containerClassName={containerClassName} className={className} style={style} />
  </div>
);

SquareSkeleton.displayName = 'SquareSkeleton';

SquareSkeleton.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  className: PropTypes.string,
  wrapperClassName: PropTypes.string,
  containerClassName: PropTypes.string,
};

SquareSkeleton.defaultProps = {
  style: {},
  className: '',
  wrapperClassName: '',
  containerClassName: '',
};

export default SquareSkeleton;
