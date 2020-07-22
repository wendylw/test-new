import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Link } from 'react-router-dom';
import OtpModal from '../../../components/OtpModal';
import PhoneViewContainer from '../../../components/PhoneViewContainer';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation, Trans } from 'react-i18next';
import { actions as appActionCreators, getUser, getBusinessInfo, getOnlineStoreInfo } from '../../redux/modules/app';
import Utils from '../../../utils/utils';

class Login extends React.Component {
  state = {
    phone: Utils.getLocalStorageVariable('user.p'),
  };

  handleCloseOtpModal() {
    const { appActions } = this.props;

    appActions.resetOtpStatus();
  }

  handleUpdatePhoneNumber(phone) {
    this.setState({ phone });
  }

  async handleSubmitPhoneNumber() {
    const { appActions } = this.props;
    const { phone } = this.state;

    // appActions.getOtp({ phone });
    appActions.phoneNumberLogin({ phone });
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
    const { user, t } = this.props;
    const { isFetching, isLogin, hasOtp } = user || {};
    const { phone } = this.state;

    if (!hasOtp || isLogin) {
      return null;
    }

    return (
      <OtpModal
        buttonText={t('OK')}
        ResendOtpTime={20}
        phone={phone}
        onClose={this.handleCloseOtpModal.bind(this)}
        getOtp={this.handleSubmitPhoneNumber.bind(this)}
        sendOtp={this.handleWebLogin.bind(this)}
        isLoading={isFetching || isLogin}
      />
    );
  }

  render() {
    const { user, title, className, businessInfo, onlineStoreInfo, t } = this.props;
    const { isFetching, isLogin } = user || {};
    const { country } = onlineStoreInfo || {};
    const { country: businessCountry } = businessInfo || {};
    const { phone } = this.state;
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
          className="aside-bottom not-full"
          title={title}
          phone={phone}
          country={country || businessCountry}
          buttonText={t('Continue')}
          show={true}
          isLoading={isFetching}
          updatePhoneNumber={this.handleUpdatePhoneNumber.bind(this)}
          onSubmit={this.handleSubmitPhoneNumber.bind(this)}
        >
          <p className="terms-privacy text-center gray-font-opacity">
            <BrowserRouter basename="/">
              <Trans i18nKey="TermsAndPrivacyDescription">
                By tapping to continue, you agree to our
                <br />
                <Link
                  className="font-weight-bolder link__non-underline"
                  target="_blank"
                  to={Constants.ROUTER_PATHS.TERMS_OF_USE}
                  data-heap-name="cashback.login.term-link"
                >
                  Terms of Service
                </Link>
                , and{' '}
                <Link
                  className="font-weight-bolder link__non-underline"
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

export default compose(
  withTranslation('Common'),
  connect(
    state => ({
      user: getUser(state),
      businessInfo: getBusinessInfo(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Login);
