import React from 'react';
import config from "../config";

const withConfig = mapStateToProps => TheComponent => ({ children, ...props }) => {
  const { table, business } = config;

  if (!table || !business) {
    const error = 'Page Params Incorrect.';
    console.error('Error: "%s", URL should be: http(s)://BUSINESS.top.domain/?table=NUMBER', error);
    return <div>{error}</div>
  }

  let newProps = { ...config };

  if (typeof mapStateToProps === 'function') {
    newProps = mapStateToProps(newProps);
  }

  return (
    <TheComponent {...props} config={config} {...newProps}>{children}</TheComponent>
  )
}

export default withConfig
