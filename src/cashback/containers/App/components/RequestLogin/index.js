import React from 'react';
import { withTranslation } from 'react-i18next';
import beepLoginImage from '../../../../../images/login.svg';
import './RequestLogin.scss';
import Loader from '../../../../../common/components/Loader';

function RequestLogin(props) {
  const { t, onClick, isLoginRequestStatusPending } = props;

  return (
    <section className="request-login flex flex-column flex-middle flex-center">
      {isLoginRequestStatusPending ? (
        <>
          <Loader className="request-login__prompt-loader circle-loader" />
          {!isLoginRequestStatusPending ? (
            <span className="margin-top-bottom-smaller">{t('Redirecting...')}</span>
          ) : null}
        </>
      ) : (
        <>
          <section className="page-login__content text-center">
            <figure className="page-login__image-container">
              <img src={beepLoginImage} alt="otp" />
            </figure>
          </section>

          <p className="text-center text-size-big font-weight-bold padding-top-bottom-small">{t('CashbackLoginTip')}</p>
          <button
            onClick={onClick}
            className="login-button login-button__fill text-uppercase"
            data-heap-name="cashback.common.request-login.btn"
          >
            {t('Login')}
          </button>
        </>
      )}
    </section>
  );
}

RequestLogin.displayName = 'RequestLogin';

export default withTranslation('Cashback')(RequestLogin);
