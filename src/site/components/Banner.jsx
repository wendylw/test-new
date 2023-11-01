import React from 'react';
import PropTypes from 'prop-types';
import './Banner.scss';

const Banner = ({ className, children, title }) => (
  <div className={`site-banner padding-left-right-normal${className ? ` ${className}` : ''}`}>
    <i className="site-banner__circle" />
    {!title ? null : <h2 className="site-banner__title text-size-huge text-weight-bolder">{title}</h2>}
    {children}
  </div>
);

Banner.displayName = 'SiteBanner';

Banner.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  title: PropTypes.string,
};

Banner.defaultProps = {
  className: '',
  children: null,
  title: '',
};

export default Banner;
