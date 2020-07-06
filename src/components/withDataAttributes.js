import React from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';
/**
 * This is a HOC to help to carry arbitrary data attributes (the attributes that starts with "data-") to inner component.
 */
export default Component => {
  const WithDataAttr = props => {
    const dataAttrs = {};
    Object.keys(props).forEach(propName => {
      if (/^data-/.test(propName)) {
        dataAttrs[propName] = props[propName];
      }
    });
    return <Component {...props} dataAttributes={dataAttrs} />;
  };
  hoistNonReactStatic(WithDataAttr, Component);
  return WithDataAttr;
};
