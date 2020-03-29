import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { fakeAuth } from '../utils';

const ProtectedRoute = ({ children, ...props }) => {
  return (
    <Route
      {...props}
      render={({ location }) => {
        return fakeAuth.isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/auth/login',
              state: { from: location },
            }}
          />
        );
      }}
    />
  );
};

export default ProtectedRoute;
