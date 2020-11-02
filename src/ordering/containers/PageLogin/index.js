import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import OtpModal from '../../../components/OtpModal';
import PhoneViewContainer from '../../../components/PhoneViewContainer';
import TermsAndPrivacy from '../../../components/TermsAndPrivacy';
import Constants from '../../../utils/constants';
import Header from '../../../components/Header';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { isValidPhoneNumber } from 'react-phone-number-input/mobile';
import { actions as appActionCreators, getUser, getOnlineStoreInfo, getOtpType } from '../../redux/modules/app';
import Utils from '../../../utils/utils';
import beepLoginDisabled from '../../../images/beep-login-disabled.png';
import beepLoginActive from '../../../images/beep-login-active.svg';
import './OrderingPageLogin.scss';
import { actions as customerActionCreators, getDeliveryDetails } from '../../redux/modules/customer';

class PageLogin extends React.Component {
  state = {
    sendOtp: false,
    phone: Utils.getLocalStorageVariable('user.p'),
  };

  componentDidUpdate(prevProps) {
    const { user } = prevProps;
    const { isLogin } = user || {};
    const { sendOtp } = this.state;
    if (sendOtp && this.props.user.isLogin && isLogin !== this.props.user.isLogin) {
      this.visitNextPage();
    }
    console.log(this.props);
  }

  visitNextPage = async () => {
    const { history, location, user, deliveryDetails, customerActions } = this.props;
    const { username, phone: orderPhone } = deliveryDetails || {};
    const { nextPage } = location;
    const { profile } = user || {};
    const { name, phone } = profile || {};
    if (nextPage && name) {
      !username && (await customerActions.patchDeliveryDetails({ username: name }));
      !orderPhone && (await customerActions.patchDeliveryDetails({ phone: phone }));

      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
        search: window.location.search,
      });
    } else if (nextPage && !name) {
      history.push({
        pathname: Constants.ROUTER_PATHS.PROFILE,
        search: window.location.search,
      });
    } else {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_CART,
        search: window.location.search,
      });
    }
  };

  handleCloseOtpModal() {
    const { appActions } = this.props;

    appActions.resetOtpStatus();
  }

  handleUpdatePhoneNumber(phone) {
    this.setState({ phone });
  }

  handleSubmitPhoneNumber(phoneNumber, type) {
    const { appActions, otpType } = this.props;
    const { phone } = this.state;

    appActions.getOtp({ phone: phoneNumber || phone, type: otpType });
    this.setState({ sendOtp: true });
  }

  updateOtpStatus() {
    this.props.appActions.updateOtpStatus();
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
    const { isFetching, isLogin, hasOtp, isError } = user || {};

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
        updateOtpStatus={this.updateOtpStatus.bind(this)}
        isLoading={isFetching || isLogin}
        isError={isError}
      />
    );
  }

  render() {
    const { t, user, className, onlineStoreInfo, history } = this.props;
    const { isLogin, showLoginPage, hasOtp, isFetching } = user || {};
    const { country } = onlineStoreInfo || {};
    const { phone } = this.state;
    const classList = ['page-login flex flex-column'];

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
      <React.Fragment>
        <section className={classList.join(' ')} data-heap-name="ordering.login.container">
          <Header
            className="flex-middle"
            contentClassName="flex-middle"
            data-heap-name="ordering.login.header"
            title="Login or Create Account"
            isPage={true}
            navFunc={() => {
              history.push({
                pathname: Constants.ROUTER_PATHS.ORDERING_CART,
                search: window.location.search,
              });
            }}
          />
          <div className="page-login__container">
            <figure className="page-login__image-container padding-top-bottom-normal margin-top-bottom-small">
              {isValidPhoneNumber(phone) ? (
                <img src={beepLoginActive} alt="otp" />
              ) : (
                <img className="page-login__disabled" src={beepLoginDisabled} alt="otp" />
              )}
            </figure>
            <PhoneViewContainer
              className="padding-normal margin-normal"
              phone={phone}
              content={t('LoginTip')}
              country={country}
              buttonText={t('Continue')}
              show={true}
              isLoading={isFetching}
              updatePhoneNumber={this.handleUpdatePhoneNumber.bind(this)}
              onSubmit={this.handleSubmitPhoneNumber.bind(this)}
            ></PhoneViewContainer>
          </div>
          <p className="text-center margin-top-bottom-small text-line-height-base text-opacity">
            <TermsAndPrivacy buttonLinkClassName="page-login__button-link" />
          </p>
        </section>
        {this.renderOtpModal()}
      </React.Fragment>
    );
  }
}

PageLogin.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
};

PageLogin.defaultProps = {
  title: '',
};

export default compose(
  withTranslation(),
  connect(
    state => ({
      user: getUser(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      deliveryDetails: getDeliveryDetails(state),
      otpType: getOtpType(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      customerActions: bindActionCreators(customerActionCreators, dispatch),
    })
  )
)(PageLogin);
