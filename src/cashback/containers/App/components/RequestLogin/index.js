import React from 'react';
import { withTranslation } from 'react-i18next';
import beepLoginImage from '../../../../../images/login.svg';
import './RequestLogin.scss';

function RequestLogin(props) {
  const { t, onClick, isLoginRequestStatusPending } = props;
  return (
    <section className="request-login flex flex-column flex-center">
      <section className="page-login__content text-center">
        <figure className="page-login__image-container">
          <img src={beepLoginImage} alt="otp" />
        </figure>
      </section>

      <p className="text-center text-size-big font-weight-bold padding-top-bottom-small">{t('CashbackLoginTip')}</p>
      <button
        disabled={isLoginRequestStatusPending}
        onClick={onClick}
        className="login-button login-button__fill text-uppercase"
        data-heap-name="cashback.common.request-login.btn"
      >
        {isLoginRequestStatusPending ? t('Processing') : t('Login')}
      </button>
    </section>
  );
}

RequestLogin.displayName = 'RequestLogin';

export default withTranslation('Cashback')(RequestLogin);
