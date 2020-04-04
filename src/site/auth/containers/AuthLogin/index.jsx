import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { fakeAuth } from '../../../utils';

const AuthLogin = () => {
  const history = useHistory();
  const location = useLocation();

  const { from } = location.state || { from: { pathname: '/' } };
  const login = () => {
    fakeAuth.authenticate(() => {
      history.replace(from);
    });
  };

  return (
    <div>
      <h3>AuthLogin/index.jsx page</h3>
      <p>You must log in to view the page at {from.pathname}</p>
      <button onClick={login}>Log in</button>
    </div>
  );
};

export default AuthLogin;
