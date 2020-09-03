import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import beepLoginImage from '../../../../../ordering/containers/Login/images/login.svg';
import { getAppToken } from '../../../utils';
import './RequestLogin.scss';

class RequestLogin extends Component {
  handleClick = () => {
    const { user } = this.props;
    getAppToken(user);
  };

  render() {
    const { t } = this.props;
    return (
      <section className="request-login flex flex-column flex-center">
        <section className="page-login__content text-center">
          <figure className="page-login__image-container">
            <img src={beepLoginImage} alt="otp" />
          </figure>
        </section>

        <p className="text-center text-size-big font-weight-bold padding-top-bottom-small">{t('CashbackLoginTip')}</p>
        <button
          onClick={this.handleClick}
          className="login-button login-button__fill text-uppercase"
          data-heap-name="cashback.common.request-login.btn"
        >
          {t('Login')}
        </button>
      </section>
    );
  }
}

export default -withTranslation('Cashback')(RequestLogin);
