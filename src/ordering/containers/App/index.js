import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { actions as appActionCreators, getOnlineStoreInfo, getUser, getBusinessInfo } from '../../redux/modules/app';
import Constants from '../../../utils/constants';
import '../../../Common.scss';
import Routes from '../Routes';
import DocumentFavicon from '../../../components/DocumentFavicon';
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

    const source = Utils.getQueryString('source');

    if (source) {
      Utils.saveSourceUrlToSessionStorage(source);
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

    try {
      await appActions.initDeliveryDetails();
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
    const { user } = this.props;
    const { isExpired, isWebview } = user || {};

    if (isExpired && prevProps.user.isExpired !== isExpired && isWebview) {
      // this.postAppMessage(user);
    }
  }

  render() {
    let { onlineStoreInfo } = this.props;
    const { favicon } = onlineStoreInfo || {};

    return (
      <main className="table-ordering fixed-wrapper fixed-wrapper__main" data-heap-name="ordering.app.container">
        <Routes />
        <DocumentFavicon icon={favicon || faviconImage} />
      </main>
    );
  }
}
App.displayName = 'OrderingApp';

export default compose(
  withTranslation(),
  connect(
    state => {
      return {
        onlineStoreInfo: getOnlineStoreInfo(state),
        businessInfo: getBusinessInfo(state),
        user: getUser(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(App);
