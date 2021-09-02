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
  getBusinessInfo,
} from '../../redux/modules/app';
import { getPageError } from '../../../redux/modules/entities/error';
import Constants from '../../../utils/constants';
import '../../../Common.scss';
import Routes from '../Routes';
import DocumentFavicon from '../../../components/DocumentFavicon';
import MessageModal from '../../components/MessageModal';
import { gtmSetUserProperties } from '../../../utils/gtm';
import faviconImage from '../../../images/favicon.ico';
import Utils from '../../../utils/utils';
import * as NativeMethods from '../../../utils/native-methods';
import loggly from '../../../utils/monitoring/loggly';

const { ROUTER_PATHS } = Constants;
let savedAddressRes;

class App extends Component {
  constructor(props) {
    super(props);
    if (Utils.isWebview()) {
      try {
        savedAddressRes = NativeMethods.getAddress();
        this.handleNativeResponse(savedAddressRes);
      } catch (e) {
        loggly.error('ordering.get-address', { message: e });
      }
    }
  }
  state = {};

  handleNativeResponse = savedAddressRes => {
    if (!savedAddressRes) {
      return;
    }

    const deliveryAddress = JSON.parse(Utils.getSessionVariable('deliveryAddress'));
    if (deliveryAddress && deliveryAddress.address) {
      return;
    }

    const { address, country, countryCode, lat, lng, savedAddressId, addressName } = savedAddressRes;
    if (savedAddressId) {
      this.setAppAddressToSession(address, country, countryCode, lat, lng, addressName);
      sessionStorage.setItem('addressIdFromNative', savedAddressId);
    } else {
      this.setAppAddressToSession(address, country, countryCode, lat, lng);
    }
  };

  setAppAddressToSession = (address, country, countryCode, lat, lng, addressName) => {
    const addressInfo = {
      address,
      addressName,
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
    const { pathname } = window.location;
    const isThankYouPage = pathname.includes(`${ROUTER_PATHS.THANK_YOU}`);
    const isOrderDetailPage = pathname.includes(`${ROUTER_PATHS.ORDER_DETAILS}`);
    const isMerchantInfPage = pathname.includes(`${ROUTER_PATHS.MERCHANT_INFO}`);
    const isReportIssuePage = pathname.includes(`${ROUTER_PATHS.REPORT_DRIVER}`);

    if (
      !(isThankYouPage || isOrderDetailPage || isMerchantInfPage || isReportIssuePage) &&
      (Utils.getUserAgentInfo().browser.includes('Safari') || Utils.isIOSWebview())
    ) {
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
    }

    this.visitErrorPage();
    try {
      await appActions.getLoginStatus();
      const { responseGql = {} } = await appActions.fetchOnlineStoreInfo();

      if (Utils.notHomeOrLocationPath(window.location.pathname)) {
        await appActions.loadCoreBusiness();
      }

      const { user, businessInfo } = this.props;
      const { onlineStoreInfo } = responseGql.data || {};

      const thankYouPageUrl = `${Constants.ROUTER_PATHS.ORDERING_BASE}${Constants.ROUTER_PATHS.THANK_YOU}`;

      if (window.location.pathname !== thankYouPageUrl) {
        this.setGtmData({
          onlineStoreInfo,
          userInfo: user,
          businessInfo,
        });
      }
    } catch (e) {
      // we don't need extra actions for exceptions, the state is already in redux.
      console.log(e);
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
    const { user, pageError } = this.props;
    const { isExpired, isWebview } = user || {};
    const { code } = prevProps.pageError || {};

    if (pageError.code && pageError.code !== code) {
      this.visitErrorPage();
    }

    if (isExpired && prevProps.user.isExpired !== isExpired && isWebview) {
      // this.postAppMessage(user);
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
App.displayName = 'OrderingApp';

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
    })
  )
)(App);
