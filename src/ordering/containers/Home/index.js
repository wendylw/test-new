import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { withTranslation, Trans } from 'react-i18next';
import _truncate from 'lodash/truncate';
import qs from 'qs';
import _isNil from 'lodash/isNil';
import Utils from '../../../utils/utils';
import { shortenUrl } from '../../../utils/shortenUrl';
import Constants from '../../../utils/constants';
import { formatToDeliveryTime } from '../../../utils/datetime-lib';
import { isAvailableOrderTime, isAvailableOnDemandOrderTime, getBusinessDateTime } from '../../../utils/store-utils';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import {
  actions as appActionsCreators,
  getBusinessUTCOffset,
  getStore,
  getEnablePayLater,
  getBusinessInfo,
  getOnlineStoreInfo,
  getRequestInfo,
  getCartBilling,
  getStoreInfoForCleverTap,
  getStoresList,
  getDeliveryInfo,
  getCategoryProductList,
  getOrderingOngoingBannerVisibility,
  getReceiptNumber,
  getFreeShippingMinAmount,
  getCashbackRate,
  getShippingType,
  getMerchantCountry,
  getUserIsLogin,
} from '../../redux/modules/app';
import {
  queryCartAndStatus as queryCartAndStatusThunk,
  clearQueryCartStatus as clearQueryCartStatusThunk,
} from '../../redux/cart/thunks';
import { getBusinessIsLoaded } from '../../../redux/modules/entities/businesses';
import CurrencyNumber from '../../components/CurrencyNumber';
import { windowSize, mainTop, marginBottom } from './utils';
import config from '../../../config';
import { computeStraightDistance } from '../../../utils/geoUtils';
import { setDateTime } from '../../../utils/time-lib';
import CleverTap from '../../../utils/clevertap';
import {
  getUserHasReachedLegalDrinkingAge,
  getShouldShowAlcoholModal,
  getHasUserSaveStore,
  getShouldShowFavoriteButton,
  getShouldCheckSaveStoreStatus,
  getStoreFullDisplayTitle,
} from './redux/common/selectors';
import {
  getUserAlcoholConsent,
  setUserAlcoholConsent,
  getUserSaveStoreStatus,
  toggleUserSaveStoreStatus,
} from './redux/common/thunks';
import { getStoreDisplayTitle } from '../Menu/redux/common/selectors';
import Header from '../../../components/Header';
import NativeHeader, { ICON_RES } from '../../../components/NativeHeader';
import Footer from './components/Footer.jsx';
import { IconEdit, IconInfoOutline, IconLocation, IconLeftArrow } from '../../../components/Icons';
import DeliverToBar from '../../../components/DeliverToBar';
import PromotionsBar from './components/PromotionsBar';
import ProductDetailDrawer from './components/ProductDetailDrawer';
import CartListDrawer from './components/CartListDrawer';
import StoreInfoAside from './components/StoreInfoAside';
import CurrentCategoryBar from './components/CurrentCategoryBar';
import ProductList from './components/ProductList';
import AlcoholModal from './components/AlcoholModal';
import OfflineStoreModal from './components/OfflineStoreModal';
import { sourceType } from './constants';
import { getIfAddressInfoExists, getAddressCoords, getAddressName } from '../../../redux/modules/address/selectors';
import './OrderingHome.scss';
import * as NativeMethods from '../../../utils/native-methods';
import logger from '../../../utils/monitoring/logger';
import { SOURCE_TYPE } from '../../../common/utils/constants';

const localState = {
  blockScrollTop: 0,
};

const SCROLL_DEPTH_DENOMINATOR = 4;

const { DELIVERY_METHOD, PREORDER_IMMEDIATE_TAG } = Constants;
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewAside: null,
      offlineStoreModal: false,
      dScrollY: 0,
      deliveryBar: false,
      callApiFinish: false,
      enablePreOrderFroMultipleStore: false,
      isValidToOrderFromMultipleStore: false,
      search: qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true }),
      windowSize: windowSize(),
    };

    this.checkUrlType();

    if (Utils.isDineInType()) {
      this.checkTableId();
    }
  }
  deliveryEntryEl = null;
  headerEl = null;
  footerEl = null;
  scrollDepthNumerator = 0;

  checkTableId = () => {
    const { table, storeId } = config;
    const { ROUTER_PATHS } = Constants;
    const { DINE } = ROUTER_PATHS;

    if (storeId) {
      if (!table) {
        window.location.href = `${DINE}?s=${storeId}&from=home`;
      }
    } else {
      window.location.href = DINE;
    }
  };

  checkUrlType = () => {
    const { history } = this.props;

    const { type = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    const deliveryTypes = Object.values(DELIVERY_METHOD);

    if (!type || !deliveryTypes.includes(type)) {
      window.location.href = window.location.origin;
    }
  };

  // copied and modified from https://docs.heap.io/docs/scroll-tracking
  trackScrollDepth = () => {
    if (!this.props.categories || !this.props.categories.length) {
      return;
    }
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const segmentHeight = scrollHeight / SCROLL_DEPTH_DENOMINATOR;
    const scrollDistance =
      window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;
    const divisible = Math.trunc(scrollDistance / segmentHeight);
    if (this.scrollDepthNumerator < divisible && divisible !== Infinity) {
      const scrollPercent = divisible * (100 / SCROLL_DEPTH_DENOMINATOR);
      this.scrollDepthNumerator += 1;
    }
  };

  componentDidMount = async () => {
    const {
      appActions,
      hasUserReachedLegalDrinkingAge,
      getUserAlcoholConsent,
      queryCartAndStatus,
      shouldCheckSaveStoreStatus,
      getUserSaveStoreStatus,
    } = this.props;

    await appActions.loadProductList();

    // Double-checking with backend only if user is not in legal drinking age
    if (!hasUserReachedLegalDrinkingAge) getUserAlcoholConsent();

    if (shouldCheckSaveStoreStatus) {
      await getUserSaveStoreStatus();
    }

    await Promise.all([appActions.loadCoreBusiness(), appActions.loadCoreStores()]);

    const shareLinkUrl = this.getShareLinkUrl();

    shortenUrl(shareLinkUrl).catch(error => logger.error(`failed to share store link(didMount): ${error.message}`));
    const { enablePayLater } = this.props;

    if (config.storeId) {
      enablePayLater ? queryCartAndStatus() : appActions.loadShoppingCart();
    }

    CleverTap.pushEvent('Menu Page - View page', this.props.storeInfoForCleverTap);

    this.getStatusFromMultipleStore();

    this.checkRange();
    this.checkOrderTime();

    // "checkDeliveryBar" function MUST call AFTER "checkOrderTime" function
    this.checkDeliveryBar();

    this.setState({ windowSize: windowSize() });

    window.addEventListener('resize', () => {
      this.setState({ windowSize: windowSize() });
    });

    this.showCartListDrawerIfNeeded();
  };

  checkDeliveryBar() {
    const isDeliveryType = Utils.isDeliveryType();
    const isPickUpType = Utils.isPickUpType();
    const expectedDeliveryDate = Utils.getSessionVariable('expectedDeliveryDate');
    const expectedDeliveryHour = Utils.getSessionVariable('expectedDeliveryHour');
    const { ifAddressInfoExists } = this.props;

    if (!isDeliveryType && !isPickUpType) {
      this.setState({
        deliveryBar: false,
      });
      return;
    }

    if (!config.storeId) {
      this.setState({
        deliveryBar: false,
      });
      return;
    }

    if (isDeliveryType) {
      this.setState({
        deliveryBar: Boolean(ifAddressInfoExists && expectedDeliveryDate && expectedDeliveryHour),
      });
      return;
    }

    if (isPickUpType) {
      this.setState({
        deliveryBar: Boolean(expectedDeliveryDate && expectedDeliveryHour),
      });
      return;
    }
  }

  showCartListDrawerIfNeeded = () => {
    const { history } = this.props;
    const { ROUTER_PATHS, ASIDE_NAMES } = Constants;
    const source = Utils.getQueryString('source');

    if (source !== sourceType.SHOPPING_CART) return;

    this.handleToggleAside(ASIDE_NAMES.CART);

    const search = Utils.getFilteredQueryString('source');

    history.replace({
      pathname: ROUTER_PATHS.ORDERING_HOME,
      search,
    });
  };

  componentDidUpdate = async (prevProps, prevState) => {
    const {
      shouldShowAlcoholModal: prevShouldShowAlcoholModal,
      ifAddressInfoExists: prevIfAddressInfoExists,
      shouldCheckSaveStoreStatus: prevShouldCheckSaveStoreStatus,
    } = prevProps;
    const {
      shouldShowAlcoholModal: currShouldShowAlcoholModal,
      ifAddressInfoExists: currIfAddressInfoExists,
      shouldCheckSaveStoreStatus: currShouldCheckSaveStoreStatus,
      getUserSaveStoreStatus,
    } = this.props;
    const { containerHeight } = prevState;

    if (prevShouldShowAlcoholModal !== currShouldShowAlcoholModal) {
      this.toggleBodyScroll(currShouldShowAlcoholModal);
    }

    if (prevIfAddressInfoExists !== currIfAddressInfoExists) {
      this.checkDeliveryBar();
    }

    this.setMainContainerHeight(containerHeight);

    if (!prevShouldCheckSaveStoreStatus && currShouldCheckSaveStoreStatus) {
      await getUserSaveStoreStatus();
    }
  };

  async componentWillUnmount() {
    const { clearQueryCartStatus } = this.props;

    window.removeEventListener('resize', () => {
      this.setState({ windowSize: windowSize() });
    });

    await clearQueryCartStatus();
  }

  getStatusFromMultipleStore = () => {
    const deliveryType = Utils.getOrderTypeFromUrl();
    const allStore = this.props.allStore || [];
    const businessUTCOffset = this.props.businessUTCOffset;

    const currentDate = new Date();

    const enablePreOrderFroMultipleStore = allStore.some(store => {
      const { qrOrderingSettings } = store;

      return qrOrderingSettings.enablePreOrder;
    });

    const isValidToOrderFromMultipleStore = allStore.some(store => {
      return isAvailableOnDemandOrderTime(store, currentDate, businessUTCOffset, deliveryType);
    });

    this.setState({
      enablePreOrderFroMultipleStore,
      isValidToOrderFromMultipleStore,
      callApiFinish: true,
    });
  };

  checkRange = () => {
    const search = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    const { addressCoords } = this.props;

    if (search.h && addressCoords && search.type === Constants.DELIVERY_METHOD.DELIVERY) {
      const { businessInfo = {} } = this.props;

      let { stores = [], qrOrderingSettings } = businessInfo;
      if (stores.length && qrOrderingSettings) {
        const { deliveryRadius } = qrOrderingSettings;
        stores = stores[0];
        const { location } = stores;
        const distance = computeStraightDistance(addressCoords, {
          lat: location.latitude,
          lng: location.longitude,
        });

        if (distance / 1000 > deliveryRadius) {
          let { search } = window.location;
          // search = search.replace(/type=[^&]*/, `type=${this.state.isPickUpType ? 'pickup' : 'delivery'}`);
          const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_HOME}${search}`);

          Utils.setSessionVariable('outRange', deliveryRadius);
          this.props.history.push({
            pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION,
            search: `${search}&callbackUrl=${callbackUrl}`,
          });
        }
      }
    }
  };

  checkOrderTime = async () => {
    if (this.isExpectedDeliverTimeExpired()) {
      Utils.removeExpectedDeliveryTime();
    }
    const { store } = this.props;
    const isDeliveryType = Utils.isDeliveryType();
    const isPickUpType = Utils.isPickUpType();
    const deliveryType = Utils.getOrderTypeFromUrl();

    const expectedDeliveryDate = Utils.getSessionVariable('expectedDeliveryDate');
    const expectedDeliveryHour = Utils.getSessionVariable('expectedDeliveryHour');
    const { ifAddressInfoExists } = this.props;

    if (!store) {
      return;
    }

    if (isDeliveryType && !ifAddressInfoExists) {
      return;
    }

    // have selected delivery time
    if (expectedDeliveryDate && expectedDeliveryHour) {
      return;
    }

    if (isDeliveryType || isPickUpType) {
      const { businessUTCOffset } = this.props;
      const currentDate = getBusinessDateTime(businessUTCOffset);

      const isAvailableOnDemandOrder = isAvailableOnDemandOrderTime(
        store,
        currentDate.toDate(), // to js Date object
        businessUTCOffset,
        deliveryType
      );

      if (!isAvailableOnDemandOrder) {
        return;
      }

      Utils.setSessionVariable(
        'expectedDeliveryDate',
        JSON.stringify({
          date: currentDate.startOf('day').toISOString(),
          isOpen: true,
          isToday: true,
        })
      );
      const expectedDeliveryHour = isDeliveryType ? { from: 'now', to: 'now' } : { from: 'now' };

      Utils.setSessionVariable('expectedDeliveryHour', JSON.stringify(expectedDeliveryHour));
    }
  };

  setMainContainerHeight = containerHeight => {
    const isValid =
      (ReactDOM.findDOMNode(this.deliveryEntryEl) || ReactDOM.findDOMNode(this.headerEl)) &&
      ReactDOM.findDOMNode(this.footerEl);
    const currentContainerHeight = Utils.getContainerElementHeight(
      [ReactDOM.findDOMNode(this.deliveryEntryEl), ReactDOM.findDOMNode(this.headerEl)].filter(el => el),
      ReactDOM.findDOMNode(this.footerEl)
    );

    if (isValid && containerHeight !== `${currentContainerHeight}px`) {
      this.setState({
        containerHeight: `${currentContainerHeight}px`,
      });
    }
  };

  getPreviousDeliveryMethod = () => {
    const { hour = {} } = Utils.getExpectedDeliveryDateFromSession();

    if (hour.from && hour.to) {
      return Constants.DELIVERY_METHOD.DELIVERY;
    }

    if (hour.from && !hour.to) {
      return Constants.DELIVERY_METHOD.PICKUP;
    }

    return null;
  };

  isExpectedDeliverTimeExpired = () => {
    const { businessUTCOffset, store } = this.props;
    const { date = {}, hour = {} } = Utils.getExpectedDeliveryDateFromSession();
    const deliverMethod = Utils.getOrderTypeFromUrl();
    const previousDeliveryMethod = this.getPreviousDeliveryMethod();
    const currentDate = new Date();

    if (!store) {
      return true;
    }

    if (!date.date || !hour.from) {
      return true;
    }

    // Remove user previously selected delivery/pickup time from session
    // Just in case the previous one they select is delivery and the new one is pickup
    // which will cause delivery/pickup time displayed in header incorrect
    if (previousDeliveryMethod && previousDeliveryMethod !== deliverMethod) {
      return true;
    }

    if (
      hour.from === PREORDER_IMMEDIATE_TAG.from &&
      !isAvailableOnDemandOrderTime(store, currentDate, businessUTCOffset, deliverMethod)
    ) {
      return true;
    }

    if (hour.from !== PREORDER_IMMEDIATE_TAG.from) {
      const expectedDate = getBusinessDateTime(businessUTCOffset, new Date(date.date));

      const expectedDeliveryTime = setDateTime(hour.from, expectedDate);

      if (expectedDeliveryTime.isBefore(currentDate)) {
        return true;
      }

      if (!isAvailableOrderTime(store, expectedDeliveryTime.toDate(), businessUTCOffset, deliverMethod)) {
        return true;
      }
    }

    return false;
  };

  getBusinessCountry = () => {
    try {
      const { businessInfo } = this.props;
      return businessInfo.country;
    } catch (e) {
      // this could happen when allBusinessInfo is not loaded.
      return undefined;
    }
  };

  toggleBodyScroll(blockScroll = false) {
    const rootEl = document.getElementById('root');
    const rootClassName = rootEl
      .getAttribute('class')
      .replace(/fixed/g, '')
      .trim();
    const listEl = document.getElementById('product-list');

    if (rootEl && listEl) {
      if (blockScroll) {
        const currentScrollTop = document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset;
        let listElOffsetTop = currentScrollTop + listEl.getBoundingClientRect().top;

        if (!Utils.getUserAgentInfo().browser.includes('Safari')) {
          let currentParent = listEl.offsetParent;

          listElOffsetTop = listEl.offsetTop;

          while (currentParent !== null) {
            listElOffsetTop += currentParent.offsetTop;
            currentParent = currentParent.offsetParent;
          }
        }

        listEl.style.top = `${listElOffsetTop - currentScrollTop}px`;

        Object.assign(localState, { blockScrollTop: currentScrollTop });
      } else {
        const { blockScrollTop } = localState;

        rootEl.setAttribute('class', rootClassName);
        listEl.style.top = '';
        window.scrollTo(0, blockScrollTop);
      }
    }
  }

  handleNavBack = () => {
    const sourceUrl = Utils.getSourceUrlFromSessionStorage();
    if (sourceUrl) {
      window.location.href = sourceUrl;
      return;
    }

    if (Utils.isWebview()) {
      NativeMethods.goBack();
      return;
    }

    this.props.history.goBack();
  };

  handleToggleAside(asideName) {
    const stopBodyScroll = asideName === Constants.ASIDE_NAMES.PRODUCT_DETAIL;

    if (!stopBodyScroll) {
      this.toggleBodyScroll(asideName === Constants.ASIDE_NAMES.CARTMODAL_HIDE ? false : !!asideName);
    }

    if (asideName === Constants.ASIDE_NAMES.CART && this.state.viewAside === Constants.ASIDE_NAMES.CART) {
      this.setState({
        viewAside: null,
      });

      this.toggleBodyScroll(false);
    } else {
      this.setState({
        viewAside: asideName,
      });
    }
  }

  renderDeliverToBar() {
    const { history, deliveryInfo, storeInfoForCleverTap } = this.props;

    const isValidTimeToOrder = this.isValidTimeToOrder();
    const { enablePreOrder } = deliveryInfo;

    const fillInDeliverToAddress = () => {
      CleverTap.pushEvent('Menu Page - Click location & shipping details bar', storeInfoForCleverTap);

      const { search } = window.location;
      const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_HOME}${search}`);

      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
        search: `${search}&callbackUrl=${callbackUrl}`,
      });

      return;
    };
    const { t, businessInfo, addressName } = this.props;
    const { stores = [] } = businessInfo;
    const pickupAddress = stores.length ? Utils.getValidAddress(stores[0], Constants.ADDRESS_RANGE.COUNTRY) : '';
    const sourceUrl = Utils.getSourceUrlFromSessionStorage();
    const backHomeSiteButtonVisibility = Boolean(sourceUrl) && !Utils.isWebview();

    return (
      <DeliverToBar
        deliverToBarRef={ref => (this.deliveryEntryEl = ref)}
        data-heap-name="ordering.home.delivery-bar"
        className="ordering-home__deliver-to flex__shrink-fixed"
        content={Utils.isDeliveryType() ? addressName : pickupAddress}
        backIcon={
          <IconLeftArrow
            className="icon icon__big icon__default text-middle flex__shrink-fixed"
            data-heap-name="order.home.delivery-bar-back-btn"
            onClick={event => {
              event.preventDefault();
              this.handleNavBack();
              event.stopPropagation();
            }}
          />
        }
        extraInfo={`${Utils.isDeliveryType() ? t('DeliverAt') : t('PickUpOn')}${
          enablePreOrder ? ` . ${this.getExpectedDeliveryTime()}` : ` . ${t('DeliverNow', { separator: ' .' })}`
        }`}
        showBackButton={backHomeSiteButtonVisibility}
        gotoLocationPage={fillInDeliverToAddress}
        icon={<IconLocation className="icon icon__smaller text-middle flex__shrink-fixed" />}
      >
        {isValidTimeToOrder || enablePreOrder ? (
          <IconEdit
            className="icon icon__small icon__primary flex flex-middle flex__shrink-fixed"
            onClick={fillInDeliverToAddress}
          />
        ) : null}
      </DeliverToBar>
    );
  }

  getExpectedDeliveryTime = () => {
    const { businessUTCOffset } = this.props;
    const { date, hour } = Utils.getExpectedDeliveryDateFromSession();
    const locale = this.getBusinessCountry();

    if (date && hour && locale) {
      return formatToDeliveryTime({
        date: date,
        hour: hour,
        locale,
        businessUTCOffset,
        separator: ' .',
      });
    }

    return null;
  };

  renderOfflineModal = enableLiveOnline => {
    const { storeFullDisplayTitle } = this.props;
    return <OfflineStoreModal currentStoreName={storeFullDisplayTitle} enableLiveOnline={enableLiveOnline} />;
  };

  renderPickupAddress = () => {
    const { deliveryInfo } = this.props;

    if (!deliveryInfo) {
      return null;
    }

    return (
      <div className="flex flex-top">
        <div>
          <p className="deliver-to-entry__address padding-top-bottom-smaller text-middle text-opacity text-omit__single-line">
            {this.getExpectedDeliveryTime()}
          </p>
        </div>
      </div>
    );
  };

  isPreOrderEnabled = () => {
    const { enablePreOrder } = this.props.deliveryInfo;
    const { enablePreOrderFroMultipleStore } = this.state;
    const storeId = config.storeId;

    return !storeId ? enablePreOrderFroMultipleStore : !!enablePreOrder;
  };

  isValidTimeToOrder = () => {
    const { isValidToOrderFromMultipleStore } = this.state;
    const { store, businessUTCOffset } = this.props;
    const currentTime = new Date();
    const deliverMethod = Utils.getOrderTypeFromUrl();

    if (!Utils.isDeliveryType() && !Utils.isPickUpType()) {
      return true;
    }

    // not select store
    if (!store) {
      return isValidToOrderFromMultipleStore;
    }

    return isAvailableOnDemandOrderTime(store, currentTime, businessUTCOffset, deliverMethod);
  };

  renderHeaderChildren() {
    const { requestInfo, t, storeInfoForCleverTap } = this.props;
    const type = Utils.getOrderTypeFromUrl();
    const { allStore } = this.props;
    const { search } = this.state;
    const { h } = search;

    switch (type) {
      case DELIVERY_METHOD.DINE_IN:
        const { tableId } = requestInfo || {};
        return (
          <span className="ordering-home__table-id flex__shrink-fixed flex__shrink-fixed padding-normal text-opacity">
            {t('TableIdText', { tableId })}
          </span>
        );
      case DELIVERY_METHOD.TAKE_AWAY:
        return <span className="flex__shrink-fixed padding-normal text-opacity">{t('TAKE_AWAY')}</span>;
      case DELIVERY_METHOD.DELIVERY:
      case DELIVERY_METHOD.PICKUP:
        return h || (allStore && allStore.length === 1) ? (
          <IconInfoOutline
            onClick={() => {
              CleverTap.pushEvent('Menu Page - Click info button', storeInfoForCleverTap);
              this.handleToggleAside(Constants.ASIDE_NAMES.DELIVERY_DETAIL);
            }}
            className="icon icon__big text-middle flex__shrink-fixed"
          />
        ) : null;
      default:
        return null;
    }
  }

  getContentClassName = ({ isValidTimeToOrder, isPreOrderEnabled, shippingType, isDisplayedStoreInfoIcon }) => {
    return !isValidTimeToOrder &&
      isPreOrderEnabled &&
      (shippingType === DELIVERY_METHOD.PICKUP || shippingType === DELIVERY_METHOD.DELIVERY) &&
      isDisplayedStoreInfoIcon
      ? 'ordering-home__store-info--enabled'
      : '';
  };

  isBackHomeSiteButtonVisibilityOnHeader = () => {
    // The back button has already display on delivery bar
    // no need display on header
    if (this.state.deliveryBar) {
      return false;
    }

    // Only display back button for delivery order
    if (!Utils.isDeliveryOrder()) {
      return false;
    }

    if (Utils.isWebview()) {
      return false;
    }

    const sourceUrl = Utils.getSourceUrlFromSessionStorage();

    return Boolean(sourceUrl);
  };

  renderHeader() {
    const {
      onlineStoreInfo,
      businessInfo,
      cartBilling,
      deliveryInfo,
      requestInfo,
      allStore,
      storeFullDisplayTitle,
    } = this.props;
    const { search } = this.state;
    const { defaultLoyaltyRatio, enableCashback } = businessInfo || {};
    const isDeliveryType = Utils.isDeliveryType();
    const isPickUpType = Utils.isPickUpType();
    // todo: we may remove legacy delivery fee in the future, since the delivery is dynamic now. For now we keep it for backward compatibility.
    const { deliveryFee: legacyDeliveryFee, storeAddress } = deliveryInfo || {};
    const deliveryFee = cartBilling ? cartBilling.shippingFee : legacyDeliveryFee;
    const { tableId } = requestInfo || {};
    const backHomeSiteButtonVisibility = this.isBackHomeSiteButtonVisibilityOnHeader();
    const isValidTimeToOrder = this.isValidTimeToOrder();
    const isPreOrderEnabled = this.isPreOrderEnabled();
    const contentClassName = this.getContentClassName({
      isValidTimeToOrder,
      isPreOrderEnabled,
      shippingType: Utils.getOrderTypeFromUrl(),
      isDisplayedStoreInfoIcon: search.h || (allStore && allStore.length === 1),
    });

    return (
      <Header
        headerRef={ref => (this.headerEl = ref)}
        className={
          isDeliveryType || isPickUpType
            ? `${enableCashback && defaultLoyaltyRatio ? 'flex-top' : 'flex-middle'} ordering-home__header`
            : `flex-middle border__bottom-divider ${tableId ? 'ordering-home__dine-in-header' : ''}`
        }
        contentClassName={`${contentClassName} ${
          isDeliveryType || isPickUpType
            ? enableCashback && defaultLoyaltyRatio
              ? 'flex-top'
              : 'flex-middle'
            : 'flex-middle'
        } padding-left-right-small`}
        style={{ top: this.deliveryEntryEl ? `${this.deliveryEntryEl.clientHeight}px` : 0 }}
        data-heap-name="ordering.home.header"
        isPage={true}
        isStoreHome={true}
        logo={onlineStoreInfo.logo}
        title={storeFullDisplayTitle}
        isDeliveryType={isDeliveryType}
        deliveryFee={deliveryFee}
        enableCashback={enableCashback}
        defaultLoyaltyRatio={defaultLoyaltyRatio}
        navFunc={this.handleNavBack}
        isValidTimeToOrder={isValidTimeToOrder}
        enablePreOrder={isPreOrderEnabled}
        storeAddress={storeAddress}
        backHomeSiteButtonVisibility={backHomeSiteButtonVisibility}
      >
        {this.renderHeaderChildren()}
      </Header>
    );
  }

  handleLegalAge = isAgeLegal => {
    const { storeInfoForCleverTap, setUserAlcoholConsent } = this.props;

    CleverTap.pushEvent('Menu Page - Alcohol Counsent - Pop up', storeInfoForCleverTap);

    if (isAgeLegal) {
      CleverTap.pushEvent('Menu Page - Alcohol Consent - Click yes', storeInfoForCleverTap);
      // No need to wait for response
      setUserAlcoholConsent();
    } else {
      CleverTap.pushEvent('Menu Page - Alcohol Consent - Click no', storeInfoForCleverTap);
    }
  };

  isCountryNeedAlcoholPop = country => {
    if (country === 'TH' || country === 'SG') return false;
    return true;
  };

  getItemFromStore = (itemValue, itemName) => {
    const { search } = this.state;
    const { h } = search;
    const { allStore } = this.props;
    const { qrOrderingSettings } = allStore[0] || {};

    if (!h && allStore && allStore.length === 1) {
      return qrOrderingSettings[itemName];
    }
    return itemValue;
  };

  isRenderDetailModal = (validTimeFrom, validTimeTo, callApiFinish) => {
    const { search } = this.state;
    const { h } = search;
    const { allStore } = this.props;

    return !h
      ? allStore && allStore.length === 1
      : Utils.isDeliveryType() || (Utils.isPickUpType() && validTimeFrom && validTimeTo && callApiFinish);
  };

  isRenderDeliveryFee = (enableConditionalFreeShipping, freeShippingMinAmount) => {
    const adBarHeight = 30;
    const { dScrollY } = this.state;
    const { storeId } = config;

    return (
      enableConditionalFreeShipping &&
      freeShippingMinAmount &&
      Utils.isDeliveryType() &&
      dScrollY < adBarHeight &&
      storeId
    );
  };

  formatCleverTapAttributes(product) {
    return {
      'category name': product.categoryName,
      'category rank': product.categoryRank,
      'product name': product.title,
      'product rank': product.rank,
      'product image url': product.images?.length > 0 ? product.images[0] : '',
      amount: !_isNil(product.originalDisplayPrice) ? product.originalDisplayPrice : product.displayPrice,
      discountedprice: !_isNil(product.originalDisplayPrice) ? product.displayPrice : '',
      'is bestsellar': product.isFeaturedProduct,
      'has picture': product.images?.length > 0,
    };
  }

  cleverTapTrack = (eventName, attributes = {}) => {
    const { storeInfoForCleverTap } = this.props;

    CleverTap.pushEvent(eventName, { ...storeInfoForCleverTap, ...attributes });
  };

  getPromotionsBarRef = ref => {
    this.promotionEl = ref;
  };

  handleConfirmAlcoholDenied = () => {
    this.handleNavBack();
  };

  getShareLinkUrl = () => {
    const storeUrl = window.location.href;
    const shareLinkUrl = `${storeUrl}&source=${SOURCE_TYPE.SHARED_LINK}&utm_source=store_link&utm_medium=share`;

    return shareLinkUrl;
  };

  handleClickShare = async () => {
    try {
      const {
        t,
        freeShippingMinAmount,
        cashbackRate,
        shippingType,
        merchantCountry,
        storeFullDisplayTitle,
      } = this.props;
      const storeName = _truncate(`${storeFullDisplayTitle}`, { length: 33 });

      const shareLinkUrl = this.getShareLinkUrl();

      const { url_short } = await shortenUrl(shareLinkUrl);

      const para = {
        link: `${url_short}`,
        title: t('shareTitle', { storeName }),
      };
      NativeMethods.shareLink(para);

      CleverTap.pushEvent('Menu page - Click share store link', {
        country: merchantCountry,
        'free delivery above': freeShippingMinAmount || 0,
        'shipping type': shippingType,
        cashback: cashbackRate,
      });
    } catch (error) {
      logger.error(`failed to share store link(click): ${error.message}`);
    }
  };

  handleClickSaveFavoriteStore = async () => {
    const {
      appActions,
      merchantCountry,
      shippingType,
      cashbackRate,
      hasUserSaveStore,
      hasUserLoggedIn,
      freeShippingMinAmount,
      toggleUserSaveStoreStatus,
    } = this.props;

    CleverTap.pushEvent('Menu page - Click saved favourite store button', {
      country: merchantCountry,
      'free delivery above': freeShippingMinAmount || 0,
      'shipping type': shippingType,
      action: hasUserSaveStore ? 'unsaved' : 'saved',
      cashback: cashbackRate,
    });

    if (!hasUserLoggedIn) {
      await appActions.loginByBeepApp();
      if (!this.props.hasUserLoggedIn) return;
    }

    toggleUserSaveStoreStatus();
  };

  getRightContentOfHeader = () => {
    const rightContents = [];

    rightContents.push(this.getShareLinkConfig());
    rightContents.push(this.getSaveFavoriteStoreConfig());

    // Filter out falsy values
    return rightContents.filter(config => config);
  };

  getShareLinkConfig = () => {
    const { SHARE } = ICON_RES;
    const isDeliveryOrder = Utils.isDeliveryOrder();

    if (!isDeliveryOrder) return null;

    try {
      const { BEEP_MODULE_METHODS } = NativeMethods;
      const hasShareLinkSupport = NativeMethods.hasMethodInNative(BEEP_MODULE_METHODS.SHARE_LINK);
      if (hasShareLinkSupport) {
        return {
          id: 'headerRightShareButton',
          iconRes: SHARE,
          onClick: this.handleClickShare,
        };
      }
    } catch (error) {
      console.error(`failed to share store link: ${error.message}`);
      return null;
    }
  };

  getSaveFavoriteStoreConfig = () => {
    const { FAVORITE, FAVORITE_BORDER } = ICON_RES;
    const { hasUserSaveStore, shouldShowFavoriteButton } = this.props;

    if (!shouldShowFavoriteButton) return null;

    return {
      id: 'headerRightFavoriteButton',
      iconRes: hasUserSaveStore ? FAVORITE : FAVORITE_BORDER,
      onClick: this.handleClickSaveFavoriteStore,
    };
  };

  render() {
    const {
      t,
      categories,
      onlineStoreInfo,
      businessInfo,
      businessLoaded,
      requestInfo,
      history,
      freeDeliveryFee,
      deliveryInfo,
      enablePayLater,
      shouldShowAlcoholModal,
      orderingOngoingBannerVisibility,
      receiptNumber,
      storeDisplayTitle,
      ...otherProps
    } = this.props;
    const {
      storeAddress,
      telephone,
      validDays,
      validTimeFrom,
      validTimeTo,
      freeShippingMinAmount,
      enableConditionalFreeShipping,
      enableLiveOnline,
      breakTimeFrom,
      breakTimeTo,
    } = deliveryInfo;
    const { viewAside, callApiFinish, windowSize } = this.state;
    const { tableId, shippingType } = requestInfo || {};
    const { promotions } = businessInfo || {};
    const isWebview = Utils.isWebview();

    if (!onlineStoreInfo || !categories) {
      return null;
    }

    return (
      <section className="ordering-home flex flex-column">
        {isWebview && (
          <NativeHeader
            isPage={true}
            rightContent={this.getRightContentOfHeader()}
            title={storeDisplayTitle}
            navFunc={() => {
              if (viewAside === Constants.ASIDE_NAMES.PRODUCT_DETAIL) {
                this.handleToggleAside();
                return;
              }

              NativeMethods.closeWebView();
            }}
          />
        )}
        {this.state.deliveryBar && this.renderDeliverToBar()}
        {this.renderHeader()}
        <PromotionsBar promotionRef={this.getPromotionsBarRef} promotions={promotions} shippingType={shippingType} />
        {this.isRenderDeliveryFee(enableConditionalFreeShipping, freeShippingMinAmount) ? (
          <p
            ref={ref => (this.deliveryFeeEl = ref)}
            className="ordering-home__delivery-fee padding-small text-center sticky-wrapper"
            style={{
              top: `${(this.headerEl ? this.headerEl.clientHeight : 0) +
                (this.deliveryEntryEl ? this.deliveryEntryEl.clientHeight : 0)}px`,
            }}
          >
            <Trans i18nKey="FreeDeliveryPreviousPrompt" freeShippingMinAmount={freeShippingMinAmount}>
              Free Delivery with <CurrencyNumber money={freeShippingMinAmount || 0} /> & above
            </Trans>
          </p>
        ) : null}
        <div
          className="ordering-home__container flex flex-top sticky-wrapper"
          style={{
            top: `${mainTop({
              headerEls: [this.deliveryEntryEl, this.headerEl, this.deliveryFeeEl, this.promotionEl],
            })}px`,
            height: `${windowSize.height -
              mainTop({
                headerEls: [this.deliveryEntryEl, this.headerEl, this.deliveryFeeEl, this.promotionEl],
              }) -
              marginBottom({
                footerEls: [this.footerEl],
              })}px`,
          }}
        >
          <CurrentCategoryBar
            containerId="product-list"
            categories={categories}
            viewAside={viewAside}
            onCategoryClick={() => {
              this.cleverTapTrack('Menu Page - Click category');
            }}
          />
          <ProductList
            style={{
              paddingBottom:
                Utils.isSafari && Utils.getUserAgentInfo().isMobile
                  ? `${marginBottom({
                      footerEls: [this.footerEl],
                    })}px`
                  : '0',
            }}
            onToggle={this.handleToggleAside.bind(this)}
            isValidTimeToOrder={this.isValidTimeToOrder() || this.isPreOrderEnabled()}
            onClickProductItem={({ product = {} }) => {
              this.cleverTapTrack('Menu Page - Click product', this.formatCleverTapAttributes(product));
            }}
            onProductDetailShown={({ product = {} }) => {
              this.cleverTapTrack('Menu Page - View products', this.formatCleverTapAttributes(product));
            }}
          />
        </div>
        <CartListDrawer
          footerEl={this.footerEl}
          viewAside={viewAside}
          show={viewAside === Constants.ASIDE_NAMES.CART}
          enablePayLater={enablePayLater}
          onToggle={this.handleToggleAside.bind(this, Constants.ASIDE_NAMES.CARTMODAL_HIDE)}
          onClearCart={() => {
            this.cleverTapTrack('Menu Page - Cart Preview - Click clear all');
          }}
          onIncreaseCartItem={(product = {}) => {
            this.cleverTapTrack(
              'Menu Page - Cart Preview - Increase quantity',
              this.formatCleverTapAttributes(product)
            );
          }}
          onDecreaseCartItem={(product = {}) => {
            this.cleverTapTrack(
              'Menu Page - Cart Preview - Decrease quantity',
              this.formatCleverTapAttributes(product)
            );
          }}
        />
        <ProductDetailDrawer
          footerEl={this.footerEl}
          onlineStoreInfo={onlineStoreInfo}
          show={viewAside === Constants.ASIDE_NAMES.PRODUCT_DETAIL}
          enablePayLater={enablePayLater}
          viewAside={viewAside}
          onToggle={this.handleToggleAside.bind(this)}
          hideCloseButton={isWebview}
          onIncreaseProductDetailItem={(product = {}) => {
            this.cleverTapTrack('Product details - Increase quantity', this.formatCleverTapAttributes(product));
          }}
          onDecreaseProductDetailItem={(product = {}) => {
            this.cleverTapTrack('Product details - Decrease quantity', this.formatCleverTapAttributes(product));
          }}
          onUpdateCartOnProductDetail={(product = {}) => {
            this.cleverTapTrack('Menu Page - Add to Cart', this.formatCleverTapAttributes(product));
          }}
        />
        {this.isRenderDetailModal(validTimeFrom, validTimeTo, callApiFinish) && (
          <StoreInfoAside
            footerEl={this.footerEl}
            onlineStoreInfo={onlineStoreInfo}
            businessInfo={businessInfo}
            storeAddress={storeAddress}
            telephone={telephone}
            validDays={this.getItemFromStore(validDays, 'validDays')}
            validTimeFrom={this.getItemFromStore(validTimeFrom, 'validTimeFrom')}
            validTimeTo={this.getItemFromStore(validTimeTo, 'validTimeTo')}
            businessLoaded={businessLoaded}
            show={viewAside === Constants.ASIDE_NAMES.DELIVERY_DETAIL}
            onToggle={this.handleToggleAside.bind(this)}
            enablePreOrder={this.isPreOrderEnabled()}
            isValidTimeToOrder={this.isValidTimeToOrder() || this.isPreOrderEnabled()}
            breakTimeFrom={this.getItemFromStore(breakTimeFrom, 'breakTimeFrom')}
            breakTimeTo={this.getItemFromStore(breakTimeTo, 'breakTimeTo')}
          />
        )}
        {!this.isValidTimeToOrder() && !this.isPreOrderEnabled() ? (
          <div className="ordering-home__close-cover"></div>
        ) : null}

        {orderingOngoingBannerVisibility && (
          <div
            ref={ref => (this.tableSummaryBannerEl = ref)}
            style={{
              top: `${windowSize.height -
                marginBottom({
                  footerEls: [this.footerEl, this.tableSummaryBannerEl],
                })}px`,
              bottom: `${marginBottom({
                footerEls: [this.footerEl],
              })}px`,
            }}
            className="ordering-home__table-summary-banner flex flex-middle flex__fluid-content flex-space-between padding-normal"
          >
            <div className="flex flex-middle">
              <i className="ordering-home__icon" />
              <span className="ordering-home__table-summary-banner-text margin-left-right-smaller">
                {t('OrderOngoing')}
              </span>
            </div>
            <Link
              className="ordering-home__view-order-button button button__link text-uppercase text-weight-bolder"
              to={{
                pathname: Constants.ROUTER_PATHS.ORDERING_TABLE_SUMMARY,
                search: qs.stringify(
                  {
                    h: Utils.getStoreHashCode(),
                    type: Utils.getOrderTypeFromUrl(),
                    receiptNumber: receiptNumber,
                  },
                  { addQueryPrefix: true }
                ),
              }}
            >
              {t('ViewOrder')}
            </Link>
          </div>
        )}

        <Footer
          {...otherProps}
          style={{
            top: `${windowSize.height -
              marginBottom({
                footerEls: [this.footerEl],
              })}px`,
          }}
          footerRef={ref => (this.footerEl = ref)}
          enablePayLater={enablePayLater}
          onToggle={this.handleToggleAside.bind(this)}
          tableId={tableId}
          onShownCartListDrawer={() => {
            this.cleverTapTrack('Menu Page - Click cart');
            this.handleToggleAside(Constants.ASIDE_NAMES.CART);
          }}
          onClickOrderNowButton={() => {
            this.cleverTapTrack('Menu Page - Click order now');
          }}
          isValidTimeToOrder={this.isValidTimeToOrder()}
          history={history}
          isLiveOnline={enableLiveOnline}
          enablePreOrder={this.isPreOrderEnabled()}
        />
        {shouldShowAlcoholModal ? (
          <AlcoholModal
            onConfirmAlcoholDenied={this.handleConfirmAlcoholDenied}
            handleLegalAge={this.handleLegalAge}
            country={this.getBusinessCountry()}
          />
        ) : null}
        {this.renderOfflineModal(enableLiveOnline)}
      </section>
    );
  }
}
Home.displayName = 'OrderingHome';

export default compose(
  withTranslation(['OrderingHome']),
  connect(
    state => {
      return {
        deliveryInfo: getDeliveryInfo(state),
        businessInfo: getBusinessInfo(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        requestInfo: getRequestInfo(state),
        addressName: getAddressName(state),
        addressCoords: getAddressCoords(state),
        categories: getCategoryProductList(state),
        businessLoaded: getBusinessIsLoaded(state),
        cartBilling: getCartBilling(state),
        allStore: getStoresList(state),
        businessUTCOffset: getBusinessUTCOffset(state),
        storeInfoForCleverTap: getStoreInfoForCleverTap(state),
        hasUserReachedLegalDrinkingAge: getUserHasReachedLegalDrinkingAge(state),
        ifAddressInfoExists: getIfAddressInfoExists(state),
        shouldShowAlcoholModal: getShouldShowAlcoholModal(state),
        hasUserLoggedIn: getUserIsLogin(state),
        hasUserSaveStore: getHasUserSaveStore(state),
        shouldShowFavoriteButton: getShouldShowFavoriteButton(state),
        shouldCheckSaveStoreStatus: getShouldCheckSaveStoreStatus(state),
        store: getStore(state),
        enablePayLater: getEnablePayLater(state),
        orderingOngoingBannerVisibility: getOrderingOngoingBannerVisibility(state),
        receiptNumber: getReceiptNumber(state),
        freeShippingMinAmount: getFreeShippingMinAmount(state),
        cashbackRate: getCashbackRate(state),
        shippingType: getShippingType(state),
        merchantCountry: getMerchantCountry(state),
        storeDisplayTitle: getStoreDisplayTitle(state),
        storeFullDisplayTitle: getStoreFullDisplayTitle(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionsCreators, dispatch),
      queryCartAndStatus: bindActionCreators(queryCartAndStatusThunk, dispatch),
      clearQueryCartStatus: bindActionCreators(clearQueryCartStatusThunk, dispatch),
      getUserAlcoholConsent: bindActionCreators(getUserAlcoholConsent, dispatch),
      setUserAlcoholConsent: bindActionCreators(setUserAlcoholConsent, dispatch),
      getUserSaveStoreStatus: bindActionCreators(getUserSaveStoreStatus, dispatch),
      toggleUserSaveStoreStatus: bindActionCreators(toggleUserSaveStoreStatus, dispatch),
    })
  )
)(Home);
