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
import '../../../Common.scss';
import Routes from '../Routes';
import DocumentFavicon from '../../../components/DocumentFavicon';
import MessageModal from '../../components/MessageModal';
import { gtmSetUserProperties } from '../../../utils/gtm';
import faviconImage from '../../../images/favicon.ico';
import { actions as homeActionCreators } from '../../redux/modules/home';
import Utils from '../../../utils/utils';

class App extends Component {
  constructor(props) {
    super(props);

    if (Utils.getUserAgentInfo().browser.includes('Safari') || Utils.isIOSWebview()) {
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
    }

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
  }

  visitErrorPage() {
    const { pageError } = this.props;
    const errorPageUrl = `${Constants.ROUTER_PATHS.ORDERING_BASE}${
      pageError && pageError.code && pageError.code !== '40011'
        ? Constants.ROUTER_PATHS.ERROR
        : `/${window.location.search}`
    }`;

    if (pageError && pageError.code && window.location.pathname !== errorPageUrl) {
      Utils.setSessionVariable('errorMessage', pageError.message);

      return (window.location.href = errorPageUrl);
    }
  }

  handleClearError = () => {
    this.props.appActions.clearError();
  };

  handleCloseMessageModal = () => {
    this.props.appActions.hideMessageModal();
  };

  handleApiErrorHide = apiErrorMessage => {
    const { appActions } = this.props;
    const { redirectUrl } = apiErrorMessage;
    const { ROUTER_PATHS } = Constants;
    const { ORDERING_BASE, ORDERING_LOCATION_AND_DATE, ORDERING_HOME } = ROUTER_PATHS;
    const h = Utils.getQueryVariable('h');
    const type = Utils.getQueryVariable('type');
    let callback_url;

    appActions.hideApiMessageModal();
    if (redirectUrl && window.location.pathname !== redirectUrl) {
      switch (redirectUrl) {
        case ORDERING_BASE + ORDERING_LOCATION_AND_DATE:
          callback_url = encodeURIComponent(ORDERING_HOME);
          window.location.href = `${window.location.origin}${redirectUrl}?h=${h}&type=${type}&callbackUrl=${callback_url}`;
          break;
        default:
          window.location.href = `${window.location.origin}${redirectUrl}?h=${h}&type=${type}`;
      }
    }
  };

  render() {
    let { messageModal, onlineStoreInfo, apiErrorMessage } = this.props;
    const { favicon } = onlineStoreInfo || {};

    console.log(window.location);

    return (
      <main className="table-ordering fixed-wrapper fixed-wrapper__main" data-heap-name="ordering.app.container">
        {messageModal.show ? <MessageModal data={messageModal} onHide={this.handleCloseMessageModal} /> : null}
        {apiErrorMessage.show ? (
          <MessageModal
            data={apiErrorMessage}
            onHide={() => {
              this.handleApiErrorHide(apiErrorMessage);
            }}
          />
        ) : null}
        <Routes />
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
