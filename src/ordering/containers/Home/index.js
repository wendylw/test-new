import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withTranslation, Trans } from 'react-i18next';
import qs from 'qs';
import _isNil from 'lodash/isNil';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';
import { formatToDeliveryTime } from '../../../utils/datetime-lib';
import { isAvailableOrderTime, isAvailableOnDemandOrderTime, getBusinessDateTime } from '../../../utils/store-utils';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as storesActionCreators } from '../../../stores/redux/modules/home';
import {
  actions as appActionsCreators,
  getBusinessUTCOffset,
  getStore,
  getBusinessInfo,
  getOnlineStoreInfo,
  getRequestInfo,
  getCartBilling,
  getStoreInfoForCleverTap,
} from '../../redux/modules/app';
import { getBusinessIsLoaded } from '../../../redux/modules/entities/businesses';
import {
  actions as homeActionCreators,
  getCategoryProductList,
  getDeliveryInfo,
  getPopUpModal,
  getStoresList,
  getAllProductsIds,
} from '../../redux/modules/home';
import CurrencyNumber from '../../components/CurrencyNumber';
import { fetchRedirectPageState, isSourceBeepitCom, windowSize, mainTop, marginBottom } from './utils';
import config from '../../../config';
import { BackPosition, showBackButton } from '../../../utils/backHelper';
import { computeStraightDistance } from '../../../utils/geoUtils';
import { setDateTime } from '../../../utils/time-lib';
import { captureException } from '@sentry/react';
import CleverTap from '../../../utils/clevertap';
import Header from '../../../components/Header';
import Footer from './components/Footer';
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
import './OrderingHome.scss';

const localState = {
  blockScrollTop: 0,
};

const SCROLL_DEPTH_DENOMINATOR = 4;

const { DELIVERY_METHOD, PREORDER_IMMEDIATE_TAG } = Constants;
export class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewAside: null,
      alcoholModal: false,
      offlineStoreModal: false,
      dScrollY: 0,
      deliveryBar: false,
      alcoholModalHide: Utils.getSessionVariable('AlcoholHide'),
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
      window.heap?.track('ordering.home.product-list.scroll', { percent: scrollPercent });
      this.scrollDepthNumerator += 1;
    }
  };

  get navBackUrl() {
    const source = Utils.getQueryString('source');
    if (source) {
      return source;
    }
    return config.beepitComUrl;
  }

  componentDidMount = async () => {
    const { homeActions, deliveryInfo, appActions } = this.props;

    if (isSourceBeepitCom()) {
      // sync deliveryAddress from beepit.com
      await this.setupDeliveryAddressByRedirectState();
    }

    await homeActions.loadProductList();

    const pageRf = this.getPageRf();

    if (deliveryInfo && deliveryInfo.sellAlcohol && !pageRf) {
      this.setAlcoholModalState(deliveryInfo.sellAlcohol);
    }

    await Promise.all([appActions.loadCoreBusiness(), homeActions.loadCoreStores()]);

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
  };

  checkDeliveryBar() {
    const isDeliveryType = Utils.isDeliveryType();
    const isPickUpType = Utils.isPickUpType();
    const deliveryAddress = Utils.getSessionVariable('deliveryAddress');
    const expectedDeliveryDate = Utils.getSessionVariable('expectedDeliveryDate');
    const expectedDeliveryHour = Utils.getSessionVariable('expectedDeliveryHour');
    if (!isDeliveryType && !isPickUpType) {
      this.setState({
        deliveryBar: false,
      });
      return;
    }

    if (isDeliveryType) {
      this.setState({
        deliveryBar: Boolean(deliveryAddress && expectedDeliveryDate && expectedDeliveryHour),
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

  componentDidUpdate(prevProps, prevState) {
    const { deliveryInfo: prevDeliveryInfo } = prevProps;
    const { containerHeight } = prevState;
    const { deliveryInfo } = this.props;
    const pageRf = this.getPageRf();
    const { sellAlcohol } = deliveryInfo;

    if (!prevDeliveryInfo.sellAlcohol && deliveryInfo.sellAlcohol && !pageRf) {
      if (sellAlcohol) {
        this.setAlcoholModalState(sellAlcohol);
      }
    }

    this.setMainContainerHeight(containerHeight);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => {
      this.setState({ windowSize: windowSize() });
    });
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
    if (search.h && Utils.getSessionVariable('deliveryAddress') && search.type === Constants.DELIVERY_METHOD.DELIVERY) {
      const { businessInfo = {} } = this.props;

      let { stores = [], qrOrderingSettings } = businessInfo;
      if (stores.length && qrOrderingSettings) {
        const { deliveryRadius } = qrOrderingSettings;
        stores = stores[0];
        const { location } = stores;
        const distance = computeStraightDistance(JSON.parse(Utils.getSessionVariable('deliveryAddress')).coords, {
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
    const deliveryAddress = Utils.getSessionVariable('deliveryAddress');

    const expectedDeliveryDate = Utils.getSessionVariable('expectedDeliveryDate');
    const expectedDeliveryHour = Utils.getSessionVariable('expectedDeliveryHour');

    if (!store) {
      return;
    }

    if (isDeliveryType && !deliveryAddress) {
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

  setAlcoholModalState = val => {
    this.setState({
      alcoholModal: val,
    });

    if (val && this.isCountryNeedAlcoholPop(this.getBusinessCountry()) && !this.state.alcoholModalHide) {
      this.toggleBodyScroll(true);
    } else {
      this.toggleBodyScroll(false);
    }
  };

  getPageRf = () => {
    return Utils.getQueryString('pageRefer');
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

  // get deliveryTo info from cookie and set into localStorage
  setupDeliveryAddressByRedirectState = async () => {
    const state = await fetchRedirectPageState();

    try {
      if (state.deliveryAddress) {
        sessionStorage.setItem('deliveryAddress', state.deliveryAddress);
      }
    } catch (e) {
      captureException(e);
      console.error(e);
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
    window.location.href = this.navBackUrl;
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

    // table ordering situation
    if (!deliveryInfo || (!Utils.isDeliveryType() && !Utils.isPickUpType())) {
      return null;
    }

    if (isSourceBeepitCom()) {
      const source = Utils.getQueryString('source');
      sessionStorage.setItem('orderSource', source);
    }

    const isValidTimeToOrder = this.isValidTimeToOrder();
    const { enablePreOrder, deliveryToAddress, savedAddressName } = deliveryInfo;

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
    const { t, businessInfo } = this.props;
    const { stores = [] } = businessInfo;
    const pickupAddress = stores.length ? Utils.getValidAddress(stores[0], Constants.ADDRESS_RANGE.COUNTRY) : '';

    if (!config.storeId) {
      return null;
    }

    return (
      <DeliverToBar
        deliverToBarRef={ref => (this.deliveryEntryEl = ref)}
        data-heap-name="ordering.home.delivery-bar"
        className="ordering-home__deliver-to flex__shrink-fixed"
        content={Utils.isDeliveryType() ? savedAddressName || deliveryToAddress : pickupAddress}
        backIcon={
          <IconLeftArrow
            className="icon icon__big icon__default text-middle flex__shrink-fixed"
            data-heap-name="order.home.delivery-bar-back-btn"
            onClick={event => {
              event.preventDefault();
              window.location.href = this.navBackUrl;
              event.stopPropagation();
            }}
          />
        }
        extraInfo={`${Utils.isDeliveryType() ? t('DeliverAt') : t('PickUpOn')}${
          enablePreOrder ? ` . ${this.getExpectedDeliveryTime()}` : ` . ${t('DeliverNow', { separator: ' .' })}`
        }`}
        showBackButton={showBackButton({
          isValidTimeToOrder,
          enablePreOrder,
          backPosition: BackPosition.DELIVERY_TO,
        })}
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
    const { onlineStoreInfo, businessInfo } = this.props;
    const { stores, multipleStores } = businessInfo || {};
    const { name } = multipleStores && stores && stores[0] ? stores[0] : {};
    const currentStoreName = `${onlineStoreInfo.storeName}${name ? ` (${name})` : ''}`;

    return <OfflineStoreModal currentStoreName={currentStoreName} enableLiveOnline={enableLiveOnline} />;
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
    const { requestInfo, t } = this.props;
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
          <IconInfoOutline className="icon icon__big text-middle flex__shrink-fixed" />
        ) : null;
      default:
        return null;
    }
  }

  renderHeader() {
    const {
      onlineStoreInfo,
      businessInfo,
      cartBilling,
      deliveryInfo,
      allStore,
      requestInfo,
      storeInfoForCleverTap,
    } = this.props;
    const { stores, multipleStores, defaultLoyaltyRatio, enableCashback } = businessInfo || {};
    const { name } = multipleStores && stores && stores[0] ? stores[0] : {};
    const isDeliveryType = Utils.isDeliveryType();
    const isPickUpType = Utils.isPickUpType();
    // todo: we may remove legacy delivery fee in the future, since the delivery is dynamic now. For now we keep it for backward compatibility.
    const { deliveryFee: legacyDeliveryFee, storeAddress } = deliveryInfo || {};
    const deliveryFee = cartBilling ? cartBilling.shippingFee : legacyDeliveryFee;
    const { tableId } = requestInfo || {};

    const { search } = this.state;
    const { h } = search;
    const isCanClickHandler = !h ? !h && allStore.length && allStore.length === 1 : true;

    return (
      <Header
        headerRef={ref => (this.headerEl = ref)}
        className={
          isDeliveryType || isPickUpType
            ? `${enableCashback && defaultLoyaltyRatio ? 'flex-top' : 'flex-middle'} ordering-home__header`
            : `flex-middle border__bottom-divider ${tableId ? 'ordering-home__dine-in-header' : ''}`
        }
        contentClassName={`${
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
        title={`${onlineStoreInfo.storeName}${name ? ` (${name})` : ''}`}
        onClickHandler={
          isCanClickHandler
            ? asideName => {
                CleverTap.pushEvent('Menu Page - Click info button', storeInfoForCleverTap);
                this.handleToggleAside(asideName);
              }
            : () => {}
        }
        isDeliveryType={isDeliveryType}
        deliveryFee={deliveryFee}
        enableCashback={enableCashback}
        defaultLoyaltyRatio={defaultLoyaltyRatio}
        navFunc={this.handleNavBack}
        isValidTimeToOrder={this.isValidTimeToOrder()}
        enablePreOrder={this.isPreOrderEnabled()}
        storeAddress={storeAddress}
      >
        {this.renderHeaderChildren()}
      </Header>
    );
  }

  handleLegalAge = isAgeLegal => {
    const { storeInfoForCleverTap } = this.props;

    CleverTap.pushEvent('Menu Page - Alcohol Counsent - Pop up', storeInfoForCleverTap);

    if (isAgeLegal) {
      CleverTap.pushEvent('Menu Page - Alcohol Consent - Click yes', storeInfoForCleverTap);
    } else {
      CleverTap.pushEvent('Menu Page - Alcohol Consent - Click no', storeInfoForCleverTap);
    }
    isAgeLegal && Utils.setSessionVariable('AlcoholHide', true);
    this.setAlcoholModalState(!isAgeLegal);
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

  cleverTapTrackForCart = (eventName, product, attributes) => {
    const { categories, allProductsIds, storeInfoForCleverTap } = this.props;
    let categoryIndex = -1;
    let categoryName = '';

    const categoriesContent = Object.values(categories) || [];

    categoriesContent.forEach((category, index) => {
      if (category.products?.find(p => p.id === product.id)) {
        categoryName = category.name;
        categoryIndex = index;
      }
    });

    CleverTap.pushEvent(eventName, {
      'category name': categoryName,
      'category rank': categoryIndex + 1,
      'product name': product.title,
      'product image url': product.images?.length > 0 ? product.images[0] : '',
      'product rank': allProductsIds.indexOf(product.id) + 1,
      amount: !_isNil(product.originalDisplayPrice) ? product.originalDisplayPrice : product.displayPrice,
      discountedprice: !_isNil(product.originalDisplayPrice) ? product.displayPrice : '',
      'is bestsellar': product.isFeaturedProduct,
      'has picture': product.images?.length > 0,
      ...storeInfoForCleverTap,
      ...attributes,
    });
  };

  render() {
    const {
      categories,
      onlineStoreInfo,
      businessInfo,
      businessLoaded,
      requestInfo,
      history,
      freeDeliveryFee,
      deliveryInfo,
      allProductsIds,
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
    const { viewAside, alcoholModal, callApiFinish, windowSize } = this.state;
    const { tableId } = requestInfo || {};
    const { storePromoTags } = businessInfo || {};

    if (!onlineStoreInfo || !categories) {
      return null;
    }

    return (
      <section className="ordering-home flex flex-column">
        {this.state.deliveryBar && this.renderDeliverToBar()}
        {this.renderHeader()}
        <PromotionsBar promotionRef={ref => (this.promotionEl = ref)} storePromoTags={storePromoTags} />
        {this.isRenderDeliveryFee(enableConditionalFreeShipping, freeShippingMinAmount) ? (
          <Trans i18nKey="FreeDeliveryPrompt" freeShippingMinAmount={freeShippingMinAmount}>
            <p
              ref={ref => (this.deliveryFeeEl = ref)}
              className="ordering-home__delivery-fee padding-small text-center sticky-wrapper"
              style={{
                top: `${(this.headerEl ? this.headerEl.clientHeight : 0) +
                  (this.deliveryEntryEl ? this.deliveryEntryEl.clientHeight : 0)}px`,
              }}
            >
              Free Delivery with <CurrencyNumber money={freeShippingMinAmount || 0} /> & above
            </p>
          </Trans>
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
            onShowCart={this.handleToggleAside.bind(this, Constants.ASIDE_NAMES.PRODUCT_ITEM)}
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
          show={viewAside === Constants.ASIDE_NAMES.CART || viewAside === Constants.ASIDE_NAMES.PRODUCT_ITEM}
          onToggle={this.handleToggleAside.bind(this, Constants.ASIDE_NAMES.CARTMODAL_HIDE)}
          onClearCart={() => {
            this.cleverTapTrack('Menu Page - Cart Preview - Click clear all');
          }}
          onIncreaseCartItem={(product = {}) => {
            this.cleverTapTrackForCart('Menu Page - Cart Preview - Increase quantity', product);
          }}
          onDecreaseCartItem={(product = {}) => {
            this.cleverTapTrackForCart('Menu Page - Cart Preview - Decrease quantity', product);
          }}
        />
        <ProductDetailDrawer
          footerEl={this.footerEl}
          onlineStoreInfo={onlineStoreInfo}
          show={viewAside === Constants.ASIDE_NAMES.PRODUCT_DETAIL}
          viewAside={viewAside}
          onToggle={this.handleToggleAside.bind(this)}
          onIncreaseProductDetailItem={(product = {}) => {
            this.cleverTapTrack('Product details - Increase quantity', product);
          }}
          onDncreaseProductDetailItem={(product = {}) => {
            this.cleverTapTrack('Product details - Decrease quantity', product);
          }}
          onUpdateCartOnProductDetail={({ product = {} }) => {
            this.cleverTapTrack('Menu Page - Add to Cart', product);
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
            onShowCart={this.handleToggleAside.bind(this, Constants.ASIDE_NAMES.PRODUCT_ITEM)}
            isValidTimeToOrder={this.isValidTimeToOrder() || this.isPreOrderEnabled()}
            breakTimeFrom={this.getItemFromStore(breakTimeFrom, 'breakTimeFrom')}
            breakTimeTo={this.getItemFromStore(breakTimeTo, 'breakTimeTo')}
          />
        )}

        {!this.isValidTimeToOrder() && !this.isPreOrderEnabled() ? (
          <div className="ordering-home__close-cover"></div>
        ) : null}
        <Footer
          {...otherProps}
          style={{
            top: `${windowSize.height -
              marginBottom({
                footerEls: [this.footerEl],
              })}px`,
          }}
          footerRef={ref => (this.footerEl = ref)}
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
        {alcoholModal && this.isCountryNeedAlcoholPop(this.getBusinessCountry()) && !this.state.alcoholModalHide ? (
          <AlcoholModal handleLegalAge={this.handleLegalAge} country={this.getBusinessCountry()} />
        ) : null}
        {this.renderOfflineModal(enableLiveOnline)}
      </section>
    );
  }
}

export default compose(
  withTranslation(['OrderingHome']),
  connect(
    state => {
      return {
        deliveryInfo: getDeliveryInfo(state),
        businessInfo: getBusinessInfo(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        requestInfo: getRequestInfo(state),
        categories: getCategoryProductList(state),
        businessLoaded: getBusinessIsLoaded(state),
        popUpModal: getPopUpModal(state),
        cartBilling: getCartBilling(state),
        allStore: getStoresList(state),
        businessUTCOffset: getBusinessUTCOffset(state),
        storeInfoForCleverTap: getStoreInfoForCleverTap(state),
        allProductsIds: getAllProductsIds(state),
        store: getStore(state),
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      storesActions: bindActionCreators(storesActionCreators, dispatch),
      appActions: bindActionCreators(appActionsCreators, dispatch),
    })
  )
)(Home);
