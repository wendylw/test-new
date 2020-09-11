import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getMessageModal,
  getError,
  getUser,
  getApiError,
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
import Utils from '../../../utils/utils';

class App extends Component {
  constructor(props) {
    super(props);

    if (Utils.isAndroidWebview()) {
      const res = window.androidInterface.getAddress();
      this.setAppAddressToSession(JSON.parse(res));
    }

    if (Utils.isIOSWebview()) {
      const res = window.prompt('getAddress');
      this.setAppAddressToSession(JSON.parse(res));
    }
  }
  state = {};

  setAppAddressToSession = res => {
    const { address, country, countryCode, lat, lng } = res;
    const addressInfo = {
      address: address,
      addressComponents: {
        country: country,
        countryCode: countryCode,
      },
      coords: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
    };
    sessionStorage.setItem('deliveryAddress', JSON.stringify(addressInfo));
  };

  async componentDidMount() {
    const { appActions } = this.props;

    this.visitErrorPage();
    await appActions.getLoginStatus();
    const { responseGql = {} } = await appActions.fetchOnlineStoreInfo();

    if (Utils.notHomeOrLocationPath(window.location.pathname)) {
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

    if (businessInfo && businessInfo.stores && businessInfo.stores.length && businessInfo.stores[0].id) {
      userProperties.store = {
        id: businessInfo.stores[0].id,
      };
    }

    gtmSetUserProperties(userProperties);
  };

  componentDidUpdate(prevProps) {
    const { appActions, user, pageError, businessInfo, apiErrorMessage } = this.props;
    const { isExpired, isWebview, isLogin, isFetching } = user || {};
    const { code } = prevProps.pageError || {};
    const { code: errorCode } = apiErrorMessage;

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
    console.log(apiErrorMessage, 'apiErrorMessage');

    if (errorCode) {
      // window.location.href = `${Constants.ROUTER_PATHS.ORDERING_BASE + Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${window.location.search}`
      console.log(errorCode, 'errocode');
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

  handleClearError = () => {
    this.props.appActions.clearError();
  };

  handleCloseMessageModal = () => {
    this.props.appActions.hideMessageModal();
  };

  render() {
    let { user, error, messageModal, onlineStoreInfo, apiErrorMessage } = this.props;
    const { message } = error || {};
    const { prompt } = user || {};
    const { favicon } = onlineStoreInfo || {};
    return (
      <main className="table-ordering" data-heap-name="ordering.app.container">
        {message ? <ErrorToast message={message} clearError={this.handleClearError} /> : null}
        {messageModal.show ? <MessageModal data={messageModal} onHide={this.handleCloseMessageModal} /> : null}
        {apiErrorMessage.show ? (
          <MessageModal
            data={apiErrorMessage}
            onHide={() => {
              this.props.appActions.hideApiMessageModal();

              if (apiErrorMessage.redirectUrl) {
                window.location.href = `${window.location.origin}${
                  apiErrorMessage.redirectUrl
                }?h=${Utils.getQueryVariable('h')}&type=${Utils.getQueryVariable('type')}`;
              }
            }}
          />
        ) : null}
        <Routes />
        <Login className="aside" title={prompt} />
        <DocumentFavicon icon={favicon || faviconImage} />
      </main>
    );
  }
}

export default compose(
  withTranslation(['ApiError', 'Common']),
  connect(
    state => {
      return {
        onlineStoreInfo: getOnlineStoreInfo(state),
        businessInfo: getBusinessInfo(state),
        user: getUser(state),
        error: getError(state),
        pageError: getPageError(state),
        messageModal: getMessageModal(state),
        apiErrorMessage: getApiError(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(App);
