import { Redirect } from 'react-router-dom';
import React from 'react';

const NotFound = () => <Redirect to="/" />;

NotFound.displayName = 'SiteNotFound';

export default NotFound;
