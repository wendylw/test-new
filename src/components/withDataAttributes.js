import React from 'react';
/**
 * This is a HOC to help to carry arbitrary data attributes (the attributes that starts with "data-") to inner component.
 */
export default Component => props => {
  const dataAttrs = {};
  Object.keys(props).forEach(propName => {
    if (/^data-/.test(propName)) {
      dataAttrs[propName] = props[propName];
    }
  });
  return <Component {...props} dataAttributes={dataAttrs} />;
};
