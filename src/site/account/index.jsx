import React from 'react';
import AccountRoute from './Routes';
import AuthButton from './components/AuthButton';

const Account = () => {
  return (
    <div>
      <h2>Account/index.jsx pages</h2>

      <AuthButton />

      <AccountRoute />
    </div>
  );
};

export default Account;
