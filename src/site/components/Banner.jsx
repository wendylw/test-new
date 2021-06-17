import React from 'react';
import './Banner.scss';

const Banner = ({ className, children, title }) => {
  return (
    <div className={`site-banner padding-left-right-normal${className ? ` ${className}` : ''}`}>
      <i className="site-banner__circle"></i>
      {!title ? null : <h2 className="site-banner__title text-size-huge text-weight-bolder">{title}</h2>}
      {children}
    </div>
  );
};
Banner.displayName = 'Banner';

export default Banner;
