import React from 'react';

const Banner = ({ children, title }) => {
  return (
    <div className="site-banner padding-left-right-normal absolute-wrapper">
      <h2 className="site-banner__title text-size-huge text-weight-bold">{title}</h2>
      {children}
    </div>
  );
};

export default Banner;
