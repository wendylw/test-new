/* eslint-disable react/prop-types */
import React from 'react';
import LockScreenImage from '../../../images/lock-screen.svg';

function RequireLoginPage({ title, onLoginButtonClick, buttonText }) {
  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        paddingBottom: '80px',
      }}
      className="flex flex-column flex-center flex-middle"
    >
      <img alt="Lock Screen" src={LockScreenImage} />
      <p className="text-weight-bolder text-center text-line-height-higher text-size-bigger padding-small">{title}</p>
      <button
        data-test-id="site.order-history.login-btn"
        style={{ minWidth: '180px' }}
        className="button button__fill margin-top-bottom-small text-weight-bolder text-uppercase"
        onClick={onLoginButtonClick}
      >
        {buttonText}
      </button>
    </div>
  );
}

RequireLoginPage.displayName = 'RequireLoginPage';

export default RequireLoginPage;
