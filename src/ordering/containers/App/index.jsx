import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
  getIsDynamicUrlExpired,
  getIsDynamicUrl,
} from '../../redux/modules/app';
import {
  getAddressInfo as getAddressInfoThunk,
  setAddressInfo as setAddressInfoThunk,
} from '../../../redux/modules/address/thunks';
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
import { SOURCE_TYPE } from '../../../common/utils/constants';
import { isURL } from '../../../common/utils';
import BeepWarningImage from '../../../images/beep-warning.svg';
import Result from '../../../common/components/Result';
import ObjectFitImage from '../../../common/components/Image/ObjectFitImage';
import styles from './App.module.scss';

const { ROUTER_PATHS } = Constants;

class App extends Component {
  constructor(props) {
    super(props);

    const source = Utils.getQueryString('source');

    if (source) {
      switch (source) {
        case SOURCE_TYPE.SHARED_LINK:
          Utils.setSessionVariable('BeepOrderingSource', source);
          break;
        case SOURCE_TYPE.SMS:
        case SOURCE_TYPE.PUSH_NOTIFICATION:
          Utils.setSessionVariable('__sr_source', source);
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

  async componentDidMount() {
    const { appActions } = this.props;
    const { pathname } = window.location;
    const isThankYouPage = pathname.includes(`${ROUTER_PATHS.THANK_YOU}`);
    const isOrderDetailPage = pathname.includes(`${ROUTER_PATHS.ORDER_DETAILS}`);
    const isMerchantInfPage = pathname.includes(`${ROUTER_PATHS.MERCHANT_INFO}`);
    const isReportIssuePage = pathname.includes(`${ROUTER_PATHS.REPORT_DRIVER}`);
    const { browser } = Utils.getUserAgentInfo();

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
      this.checkIfDineInUrlExpired();

      window.addEventListener('sh-location-change', this.checkIfDineInUrlExpired);

      const initRequests = [this.initAddressInfo(), appActions.getLoginStatus(), appActions.fetchOnlineStoreInfo()];

      if (Utils.notHomeOrLocationPath(window.location.pathname)) {
        initRequests.push(appActions.loadCoreBusiness());
      }

      await Promise.all(initRequests);

      // Must go after getLoginStatus finishes
      // Potentially change consumerId through CREATE_LOGIN_SUCCESS, so go before initDeliveryDetails
      if (Utils.isWebview()) {
        await appActions.syncLoginFromNative();
      }

      // Must go after initAddressInfo & getLoginStatus & syncLoginFromNative finish
      await appActions.initDeliveryDetails();

      const { user, businessInfo, onlineStoreInfo } = this.props;

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
    }
  }

  componentDidUpdate(prevProps) {
    const { pageError } = this.props;
    const { code } = prevProps.pageError || {};

    if (pageError.code && pageError.code !== code) {
      this.visitErrorPage();
    }
  }

  checkIfDineInUrlExpired = async () => {
    const { appActions, isDynamicUrl } = this.props;

    if (!isDynamicUrl) {
      return;
    }

    await appActions.checkUrlsValidation();
  };

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
    } catch (error) {
      console.error(`Ordering App initAddressInfo: ${error?.message || ''}`);
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

  setGtmData = ({ onlineStoreInfo, userInfo, businessInfo }) => {
    const userProperties = { onlineStoreInfo, userInfo };

    if (businessInfo && businessInfo.stores && businessInfo.stores.length && businessInfo.stores[0].id) {
      userProperties.store = {
        id: businessInfo.stores[0].id,
      };
    }

    gtmSetUserProperties(userProperties);
  };

  handleCloseMessageModal = () => {
    const { appActions } = this.props;
    appActions.hideMessageModal();
  };

  handleApiErrorHide = apiError => {
    const { appActions } = this.props;
    const { redirectUrl } = apiError;
    const { ORDERING_BASE, ORDERING_LOCATION_AND_DATE, ORDERING_HOME } = ROUTER_PATHS;
    const h = Utils.getQueryString('h');
    const type = Utils.getQueryString('type');

    appActions.hideApiMessageModal();
    if (redirectUrl && window.location.pathname !== redirectUrl) {
      switch (redirectUrl) {
        case ORDERING_BASE + ORDERING_LOCATION_AND_DATE:
          window.location.href = `${
            window.location.origin
          }${redirectUrl}?h=${h}&type=${type}&callbackUrl=${encodeURIComponent(ORDERING_HOME)}`;
          break;
        default:
          window.location.href = `${window.location.origin}${redirectUrl}?h=${h}&type=${type}`;
      }
    }
  };

  visitErrorPage() {
    const { pageError } = this.props;
    const errorPageUrl = `${Constants.ROUTER_PATHS.ORDERING_BASE}${
      pageError && pageError.code && pageError.code !== '40011'
        ? Constants.ROUTER_PATHS.ERROR
        : `/${window.location.search}`
    }`;

    if (pageError && pageError.code && window.location.pathname !== errorPageUrl) {
      Utils.setSessionVariable('errorMessage', pageError.message);

      window.location.href = errorPageUrl;
    }
  }

  render() {
    const { t, onlineStoreInfo, apiError, isDynamicUrlExpired } = this.props;
    const { favicon } = onlineStoreInfo || {};

    return (
      <main
        id="ordering-app-container"
        className="table-ordering fixed-wrapper fixed-wrapper__main"
        data-test-id="ordering.app.container"
      >
        {apiError.show ? (
          <MessageModal
            data={apiError}
            onHide={() => {
              this.handleApiErrorHide(apiError);
            }}
          />
        ) : null}
        {isDynamicUrlExpired ? (
          <Result
            customizeContent
            closeButtonClassName={styles.UrlExpiredButton}
            closeButtonContent={t('UrlExpiredButton')}
            zIndex={1000}
            onClose={() => {
              if (Utils.isWebview()) {
                NativeMethods.closeWebView();
              } else {
                window.location.href = `${window.location.protocol}//${process.env.REACT_APP_QR_SCAN_DOMAINS}${ROUTER_PATHS.QRSCAN}`;
              }
            }}
          >
            <div className="tw-justify-center tw-py-8 sm:tw-py-8px">
              <div className={styles.UrlExpiredImageContainer}>
                <ObjectFitImage src={BeepWarningImage} noCompression />
              </div>

              <h4 className={styles.UrlExpiredTitle}>{t('UrlExpiredTitle')}</h4>
              <div className={styles.UrlExpiredDescription}>{t('UrlExpiredDescription')}</div>
            </div>
          </Result>
        ) : (
          <Routes />
        )}
        <DocumentFavicon icon={favicon || faviconImage} />
      </main>
    );
  }
}

App.displayName = 'OrderingApp';

App.propTypes = {
  user: PropTypes.shape({
    isExpired: PropTypes.bool,
    isWebview: PropTypes.bool,
  }),
  pageError: PropTypes.shape({
    code: PropTypes.string,
    message: PropTypes.string,
  }),
  apiError: PropTypes.shape({
    show: PropTypes.bool,
    redirectUrl: PropTypes.string,
  }),
  appActions: PropTypes.shape({
    getLoginStatus: PropTypes.func,
    loadCoreBusiness: PropTypes.func,
    syncLoginFromNative: PropTypes.func,
    initDeliveryDetails: PropTypes.func,
    fetchOnlineStoreInfo: PropTypes.func,
    hideMessageModal: PropTypes.func,
    hideApiMessageModal: PropTypes.func,
    checkUrlsValidation: PropTypes.func,
  }),
  /* eslint-disable react/forbid-prop-types */
  businessInfo: PropTypes.object,
  onlineStoreInfo: PropTypes.object,
  /* eslint-enable */
  ifAddressInfoExists: PropTypes.bool,
  isDynamicUrlExpired: PropTypes.bool,
  isDynamicUrl: PropTypes.bool,
  getAddressInfo: PropTypes.func,
  setAddressInfo: PropTypes.func,
};

App.defaultProps = {
  user: {
    isExpired: false,
    isWebview: false,
  },
  pageError: {
    code: '',
    message: '',
  },
  apiError: {
    show: false,
    redirectUrl: '',
  },
  appActions: {
    getLoginStatus: () => {},
    loadCoreBusiness: () => {},
    syncLoginFromNative: () => {},
    initDeliveryDetails: () => {},
    fetchOnlineStoreInfo: () => {},
    hideMessageModal: () => {},
    hideApiMessageModal: () => {},
    checkUrlsValidation: () => {},
  },
  businessInfo: {},
  onlineStoreInfo: {},
  ifAddressInfoExists: false,
  isDynamicUrlExpired: false,
  isDynamicUrl: false,
  getAddressInfo: () => {},
  setAddressInfo: () => {},
};

export default compose(
  withTranslation(['ApiError', 'Common']),
  connect(
    state => ({
      onlineStoreInfo: getOnlineStoreInfo(state),
      businessInfo: getBusinessInfo(state),
      user: getUser(state),
      error: getError(state),
      pageError: getPageError(state),
      apiError: getApiError(state),
      ifAddressInfoExists: getIfAddressInfoExists(state),
      isDynamicUrlExpired: getIsDynamicUrlExpired(state),
      isDynamicUrl: getIsDynamicUrl(state),
    }),
    dispatch => ({
      getAddressInfo: bindActionCreators(getAddressInfoThunk, dispatch),
      setAddressInfo: bindActionCreators(setAddressInfoThunk, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(App);
