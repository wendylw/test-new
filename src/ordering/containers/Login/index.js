import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { BrowserRouter, Link } from 'react-router-dom';
import OtpModal from '../../../components/OtpModal';
import PhoneViewContainer from '../../../components/PhoneViewContainer';
import Constants from '../../../utils/constants';
import Header from '../../../components/Header';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as appActionCreators, getUser, getOnlineStoreInfo } from '../../redux/modules/app';
import Utils from '../../../utils/utils';
import beepLoginImage from './images/login.svg';
import './index.scss';

class Login extends React.Component {
  state = {
    sendOtp: false,
    phone: Utils.getLocalStorageVariable('user.p'),
  };

  componentDidUpdate(prevProps) {
    const { user } = prevProps;
    const { isLogin } = user || {};
    const { sendOtp } = this.state;
    if (sendOtp && this.props.user.isLogin && isLogin !== this.props.user.isLogin) {
      this.visitCartPage();
    }
  }

  visitCartPage = () => {
    const { history } = this.props;
    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_CART,
      search: window.location.search,
    });
  };

  handleCloseOtpModal() {
    const { appActions } = this.props;

    appActions.resetOtpStatus();
  }

  handleUpdatePhoneNumber(phone) {
    this.setState({ phone });
  }

  handleSubmitPhoneNumber(phoneNumber) {
    const { appActions } = this.props;
    const { phone } = this.state;

    appActions.getOtp({ phone: phoneNumber || phone });
    this.setState({ sendOtp: true });
  }

  async handleWebLogin(otp) {
    const { appActions } = this.props;

    await appActions.sendOtp({ otp });

    const { user } = this.props;
    const { accessToken, refreshToken } = user;

    if (accessToken && refreshToken) {
      appActions.loginApp({
        accessToken,
        refreshToken,
      });
    }
  }

  renderOtpModal() {
    const { t, user } = this.props;
    const { isFetching, isLogin, hasOtp } = user || {};

    if (!hasOtp || isLogin) {
      return null;
    }

    return (
      <OtpModal
        buttonText={t('OK')}
        ResendOtpTime={20}
        phone={Utils.getLocalStorageVariable('user.p')}
        onClose={this.handleCloseOtpModal.bind(this)}
        getOtp={this.handleSubmitPhoneNumber.bind(this)}
        sendOtp={this.handleWebLogin.bind(this)}
        isLoading={isFetching || isLogin}
      />
    );
  }

  render() {
    const { t, user, title, className, onlineStoreInfo, history } = this.props;
    const { isLogin, showLoginPage, hasOtp, isFetching } = user || {};
    const { country } = onlineStoreInfo || {};
    const { phone } = this.state;
    const classList = ['login page-login'];

    if (isLogin) {
      return null;
    }

    if (className) {
      classList.push(className);
    }

    if (hasOtp || showLoginPage) {
      classList.push('active');
    }

    return (
      <section className={classList.join(' ')}>
        <Header
          className="border__bottom-divider flex-middle"
          title="Account"
          isPage={true}
          navFunc={() => {
            history.push({
              pathname: Constants.ROUTER_PATHS.ORDERING_CART,
              search: window.location.search,
            });
          }}
        />
        <section className="page-login__content text-center">
          <figure className="page-login__image-container">
            <img src={beepLoginImage} alt="otp" />
          </figure>
        </section>
        <section className="page-login__container">
          <h2 className="page-login__tip">{t('LoginTip')}</h2>
          <PhoneViewContainer
            className="aside-bottom not-full"
            title={title}
            phone={phone}
            country={country}
            buttonText={t('Continue')}
            show={true}
            isLoading={isFetching}
            updatePhoneNumber={this.handleUpdatePhoneNumber.bind(this)}
            onSubmit={this.handleSubmitPhoneNumber.bind(this)}
          >
            <p className="terms-privacy text-center gray-font-opacity">
              <Trans i18nKey="TermsAndPrivacyDescription">
                By tapping to continue, you agree to our
                <br />
                <BrowserRouter basename="/">
                  <Link className="font-weight-bolder" target="_blank" to={Constants.ROUTER_PATHS.TERMS_OF_USE}>
                    Terms of Service
                  </Link>
                  , and{' '}
                  <Link className="font-weight-bolder" target="_blank" to={Constants.ROUTER_PATHS.PRIVACY}>
                    Privacy Policy
                  </Link>
                  .
                </BrowserRouter>
              </Trans>
            </p>
          </PhoneViewContainer>
        </section>
        {this.renderOtpModal()}
      </section>
    );
  }
}

Login.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
};

Login.defaultProps = {
  title: '',
};

export default compose(
  withTranslation(),
  connect(
    state => ({
      user: getUser(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Login);