import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getMessageModal,
  getError,
  getUser,
} from '../../redux/modules/app';
import { getBusinessInfo } from '../../redux/modules/cart';
import { getPageError } from '../../../redux/modules/entities/error';
import Constants from '../../../utils/constants';
import Routes from '../Routes';
import '../../../App.scss';
import DocumentFavicon from '../../../components/DocumentFavicon';
import ErrorToast from '../../../components/ErrorToast';
import MessageModal from '../../components/MessageModal';
import Login from '../../components/Login';
import { gtmSetUserProperties } from '../../../utils/gtm';
import faviconImage from '../../../images/favicon.ico';
import { actions as homeActionCreators } from '../../redux/modules/home';
import config from '../../../config';
class App extends Component {
  state = {};

  async componentDidMount() {
    const { appActions } = this.props;

    this.visitErrorPage();
    await appActions.getLoginStatus();
    const { responseGql = {} } = await appActions.fetchOnlineStoreInfo();

    if (config.storeId || !(window.location.pathname === '/ordering/' || window.location.pathname === '/ordering')) {
      await appActions.loadCoreBusiness();
    }

    const { user, businessInfo } = this.props;
    const { isLogin } = user || {};
    const { onlineStoreInfo } = responseGql.data || {};

    if (isLogin) {
      appActions.loadCustomerProfile().then(({ responseGql = {} }) => {
        const { data = {} } = responseGql;
        this.setGtmData({
          userInfo: data.user,
          businessInfo,
        });

        this.setGtmData({
          userInfo: data.user,
          businessInfo,
        });
      });
    }

    this.getTokens(isLogin);

    const thankYouPageUrl = `${Constants.ROUTER_PATHS.ORDERING_BASE}${Constants.ROUTER_PATHS.THANK_YOU}`;

    if (window.location.pathname !== thankYouPageUrl) {
      this.setGtmData({
        onlineStoreInfo,
        userInfo: user,
        businessInfo,
      });
    }
  }

  setGtmData = ({ onlineStoreInfo, userInfo, businessInfo }) => {
    const userProperties = { onlineStoreInfo, userInfo };

    if (businessInfo && businessInfo.stores.length && businessInfo.stores[0].id) {
      userProperties.store = {
        id: businessInfo.stores[0].id,
      };
    }

    gtmSetUserProperties(userProperties);
  };

  componentDidUpdate(prevProps) {
    const { appActions, user, pageError, businessInfo } = this.props;
    const { isExpired, isWebview, isLogin, isFetching } = user || {};
    const { code } = prevProps.pageError || {};

    if (pageError.code && pageError.code !== code) {
      this.visitErrorPage();
    }

    if (isExpired && prevProps.user.isExpired !== isExpired && isWebview) {
      // this.postAppMessage(user);
    }

    if (isLogin && !isFetching && prevProps.user.isLogin !== isLogin && businessInfo) {
      appActions.loadCustomerProfile().then(({ responseGql = {} }) => {
        const { data = {} } = responseGql;
        this.setGtmData({
          userInfo: data.user,
          businessInfo,
        });
      });
    }
  }

  visitErrorPage() {
    const { pageError } = this.props;
    const errorPageUrl = `${Constants.ROUTER_PATHS.ORDERING_BASE}${
      pageError && pageError.code && pageError.code !== '40011'
        ? Constants.ROUTER_PATHS.ERROR
        : `/${window.location.search}`
    }`;

    if (pageError && pageError.code && window.location.pathname !== errorPageUrl) {
      return (window.location.href = errorPageUrl);
    }
  }

  getTokens(isLogin) {
    const { appActions } = this.props;

    document.addEventListener(
      'acceptTokens',
      response => {
        const { data } = response || {};

        if (data) {
          const tokenList = data.split(',');

          if (!isLogin) {
            appActions.loginApp({
              accessToken: tokenList[0],
              refreshToken: tokenList[1],
            });
          }
        }
      },
      false
    );
  }

  // postAppMessage(user) {
  //   const { isWebview, isExpired } = user || {};

  //   if (isWebview && isExpired) {
  //     window.ReactNativeWebView.postMessage('tokenExpired');
  //   } else if (isWebview && !isExpired) {
  //     window.ReactNativeWebView.postMessage('getToken');
  //   }
  // }

  handleClearError = () => {
    this.props.appActions.clearError();
  };

  handleCloseMessageModal = () => {
    this.props.appActions.hideMessageModal();
  };

  render() {
    const { user, error, messageModal, onlineStoreInfo } = this.props;
    const { message } = error || {};
    const { prompt } = user || {};
    const { favicon } = onlineStoreInfo || {};

    return (
      <main className="table-ordering" data-heap-name="ordering.app.container">
        {message ? <ErrorToast message={message} clearError={this.handleClearError} /> : null}
        {messageModal.show ? <MessageModal data={messageModal} onHide={this.handleCloseMessageModal} /> : null}
        <Routes />
        <Login className="aside" title={prompt} />
        <DocumentFavicon icon={favicon || faviconImage} />
      </main>
    );
  }
}

export default connect(
  state => ({
    onlineStoreInfo: getOnlineStoreInfo(state),
    businessInfo: getBusinessInfo(state),
    user: getUser(state),
    error: getError(state),
    pageError: getPageError(state),
    messageModal: getMessageModal(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActionCreators, dispatch),
    homeActions: bindActionCreators(homeActionCreators, dispatch),
  })
)(App);
