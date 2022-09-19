import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getError,
  getUser,
  getApiError,
  getBusinessInfo,
} from '../../redux/modules/app';
import { getAddressInfo, setAddressInfo } from '../../../redux/modules/address/thunks';
import { getIfAddressInfoExists } from '../../../redux/modules/address/selectors';
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
import logger from '../../../utils/monitoring/logger';
import { SOURCE_TYPE } from '../Menu/constants';
import { isURL } from '../../../common/utils';

const { ROUTER_PATHS } = Constants;

class App extends Component {
  constructor(props) {
    super(props);

    const source = Utils.getQueryString('source');

    if (source) {
      switch (source) {
        case SOURCE_TYPE.SMS:
        case SOURCE_TYPE.SHARED_LINK:
        case SOURCE_TYPE.PUSH_NOTIFICATION:
          Utils.setSessionVariable('BeepOrderingSource', source);
          break;
        case SOURCE_TYPE.SHOPPING_CART:
          // no need to do anything in here, it will be used on the menu page.
          break;
        default:
          if (isURL(source)) {
            Utils.saveSourceUrlToSessionStorage(source);
          } else {
            logger.error('Ordering_App_InvalidSource', { source });
          }
      }
    }
  }

  state = {};

  initAddressInfo = async () => {
    const { getAddressInfo, setAddressInfo } = this.props;

    if (!Utils.isWebview()) {
      await getAddressInfo();
      return;
    }

    // TODO: For backward compatible sake, the code block can be deleted once the app is forced to update.
    try {
      const { BEEP_MODULE_METHODS } = NativeMethods;
      const hasSetAddressSupport = NativeMethods.hasMethodInNative(BEEP_MODULE_METHODS.SET_ADDRESS);

      if (!hasSetAddressSupport) {
        await getAddressInfo();
        const { ifAddressInfoExists } = this.props;
        if (ifAddressInfoExists) return;
      }
    } catch (e) {
      console.error(`failed to check fix address flow support: ${e.message}`);
    }

    try {
      const nativeAddressInfo = NativeMethods.getAddress();

      if (!nativeAddressInfo) return;

      const {
        savedAddressId,
        addressName: shortName,
        address: fullName,
        countryCode,
        postCode,
        lat,
        lng,
        city,
      } = nativeAddressInfo;

      await setAddressInfo({
        savedAddressId,
        shortName,
        fullName,
        coords: { lng: Number(lng), lat: Number(lat) },
        countryCode,
        postCode,
        city,
      });
    } catch (e) {
      logger.error('Ordering_App_GetAddress', { message: e.message, code: e.code, extra: e.extra });
    }
  };

  async componentDidMount() {
    const { appActions } = this.props;
    const { pathname } = window.location;
    const isThankYouPage = pathname.includes(`${ROUTER_PATHS.THANK_YOU}`);
    const isOrderDetailPage = pathname.includes(`${ROUTER_PATHS.ORDER_DETAILS}`);
    const isMerchantInfPage = pathname.includes(`${ROUTER_PATHS.MERCHANT_INFO}`);
    const isReportIssuePage = pathname.includes(`${ROUTER_PATHS.REPORT_DRIVER}`);
    const browser = Utils.getUserAgentInfo().browser;

    if (
      !(isThankYouPage || isOrderDetailPage || isMerchantInfPage || isReportIssuePage) &&
      (browser.includes('Safari') || browser.includes('AppleWebKit') || Utils.isIOSWebview())
    ) {
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
    }

    this.visitErrorPage();

    try {
      await this.initAddressInfo();
      await appActions.getLoginStatus();
      await appActions.initDeliveryDetails();
      const { responseGql = {} } = await appActions.fetchOnlineStoreInfo();

      if (Utils.isWebview()) {
        appActions.syncLoginFromNative();
      }

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
    let { onlineStoreInfo, apiErrorMessage } = this.props;
    const { favicon } = onlineStoreInfo || {};

    return (
      <main
        id="ordering-app-container"
        className="table-ordering fixed-wrapper fixed-wrapper__main"
        data-heap-name="ordering.app.container"
      >
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
        apiErrorMessage: getApiError(state),
        ifAddressInfoExists: getIfAddressInfoExists(state),
      };
    },
    dispatch => ({
      getAddressInfo: bindActionCreators(getAddressInfo, dispatch),
      setAddressInfo: bindActionCreators(setAddressInfo, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(App);
