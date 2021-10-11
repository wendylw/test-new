import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Link } from 'react-router-dom';
import OtpModal from '../../../components/OtpModal';
import PhoneViewContainer from '../../../components/PhoneViewContainer';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation, Trans } from 'react-i18next';
import { actions as appActionCreators, getUser } from '../../redux/modules/app';
import './LoyaltyLogin.scss';

class Login extends React.Component {
  state = {
    sendOtp: false,
  };

  handleCloseOtpModal() {
    const { appActions } = this.props;

    appActions.resetOtpStatus();
  }

  handleUpdateUser(user) {
    const { appActions } = this.props;

    appActions.updateUser(user);
  }

  handleSubmitPhoneNumber(phone) {
    const { appActions, otpType } = this.props;

    appActions.getOtp({ phone, type: otpType });
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

  updateOtpStatus() {
    this.props.appActions.updateOtpStatus();
  }

  renderOtpModal() {
    const { user, t } = this.props;
    const { isFetching, isResending, isLogin, hasOtp, phone, noWhatsAppAccount, country } = user || {};
    const { RESEND_OTP_TIME } = Constants;

    if (!hasOtp || isLogin) {
      return null;
    }

    return (
      <OtpModal
        buttonText={t('OK')}
        ResendOtpTime={RESEND_OTP_TIME}
        phone={phone}
        showWhatsAppResendBtn={!noWhatsAppAccount && country === 'MY'}
        onClose={this.handleCloseOtpModal.bind(this)}
        getOtp={this.handleSubmitPhoneNumber.bind(this)}
        sendOtp={this.handleWebLogin.bind(this)}
        updateOtpStatus={this.updateOtpStatus.bind(this)}
        isLoading={isFetching || isLogin}
        isResending={isResending}
      />
    );
  }

  render() {
    const { user, title, className, t } = this.props;
    const { isFetching, isLogin, phone, country } = user || {};
    const classList = ['login'];

    if (className) {
      classList.push(className);
    }

    if (!isLogin) {
      classList.push('active');
    }

    return (
      <section className={classList.join(' ')} data-heap-name="cashback.login.container">
        <PhoneViewContainer
          className="absolute-wrapper login__container padding-left-right-normal"
          title={title}
          phone={phone}
          country={country}
          buttonText={t('Continue')}
          show={true}
          isLoading={isFetching}
          updatePhoneNumber={this.handleUpdateUser.bind(this)}
          updateCountry={this.handleUpdateUser.bind(this)}
          onSubmit={this.handleSubmitPhoneNumber.bind(this)}
        >
          <p className="terms-privacy text-center text-opacity">
            <BrowserRouter basename="/">
              <Trans i18nKey="TermsAndPrivacyDescription">
                By tapping to continue, you agree to our
                <br />
                <Link
                  className="button button__link button__default text-weight-bolder"
                  target="_blank"
                  to={Constants.ROUTER_PATHS.TERMS_OF_USE}
                  data-heap-name="cashback.login.term-link"
                >
                  Terms of Service
                </Link>
                , and{' '}
                <Link
                  className="button button__link button__default text-weight-bolder"
                  target="_blank"
                  to={Constants.ROUTER_PATHS.PRIVACY}
                  data-heap-name="cashback.login.privacy-policy-link"
                >
                  Privacy Policy
                </Link>
                .
              </Trans>
            </BrowserRouter>
          </p>
        </PhoneViewContainer>
        {this.renderOtpModal()}
      </section>
    );
  }
}

Login.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
};

Login.defaultProps = {};

Login.displayName = 'CashbackLogin';

export default compose(
  withTranslation('Common'),
  connect(
    state => ({
      user: getUser(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Login);
