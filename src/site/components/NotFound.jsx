import { Redirect } from 'react-router-dom';
import React from 'react';

const NotFound = () => {
  return <Redirect to={'/'} />;
};
NotFound.displayName = 'NotFound';

export default NotFound;
