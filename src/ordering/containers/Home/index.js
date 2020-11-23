import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withTranslation, Trans } from 'react-i18next';
import qs from 'qs';
import Footer from './components/Footer';
import Header from '../../../components/Header';

import { IconEdit, IconInfoOutline, IconLocation, IconLeftArrow } from '../../../components/Icons';
import DeliverToBar from '../../../components/DeliverToBar';
import ProductDetail from './components/ProductDetail';
import CartListAside from './components/CartListAside';
import StoreInfoAside from './components/StoreInfoAside';
import CurrentCategoryBar from './components/CurrentCategoryBar';
import CategoryProductList from './components/CategoryProductList';
import AlcoholModal from './components/AlcoholModal';
import OfflineStoreModal from './components/OfflineStoreModal';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';
import { formatToDeliveryTime } from '../../../utils/datetime-lib';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as cartActionCreators, getBusinessInfo } from '../../redux/modules/cart';
import { actions as storesActionCreators } from '../../../stores/redux/modules/home';
import { actions as appActionsCreators } from '../../redux/modules/app';
import { getOnlineStoreInfo, getRequestInfo } from '../../redux/modules/app';
import { getBusinessIsLoaded } from '../../../redux/modules/entities/businesses';
import {
  actions as homeActionCreators,
  getCategoryProductList,
  getDeliveryInfo,
  getPopUpModal,
  getStoresList,
} from '../../redux/modules/home';
import CurrencyNumber from '../../components/CurrencyNumber';
import { fetchRedirectPageState, isSourceBeepitCom, windowSize, mainTop, marginBottom } from './utils';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import config from '../../../config';
import { BackPosition, showBackButton } from '../../../utils/backHelper';
import { computeStraightDistance } from '../../../utils/geoUtils';
import { captureException } from '@sentry/react';
import './OrderingHome.scss';

const localState = {
  blockScrollTop: 0,
};

const SCROLL_DEPTH_DENOMINATOR = 4;

const { DELIVERY_METHOD } = Constants;
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
      enablePreOrderFroMulitpeStore: false,
      isValidToOrderFromMulitpeStore: false,
      search: qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true }),
      windowSize: windowSize(),
    };

    if (Utils.isDineInType()) {
      this.checkTableId();
    }
    this.checkUrlType();
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
    const search = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    const { type } = search;

    if (!type) {
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

    this.handleDeliveryTimeInSession();

    await homeActions.loadProductList();

    const pageRf = this.getPageRf();
    if (deliveryInfo && deliveryInfo.sellAlcohol && !pageRf) {
      this.setAlcoholModalState(deliveryInfo.sellAlcohol);
    }

    await Promise.all([appActions.loadCoreBusiness(), homeActions.loadCoreStores()]);

    this.getStatusFromMultipleStore();

    const { deliveryInfo: NextdeliveryInfo } = this.props;
    const { enablePreOrder } = NextdeliveryInfo || {};
    if (!enablePreOrder) {
      Utils.setSessionVariable(
        'expectedDeliveryHour',
        JSON.stringify({
          from: 'now',
          to: 'now',
        })
      );
    }
    this.checkRange();
    this.checkOrderTime();

    this.setState({ windowSize: windowSize() });

    window.addEventListener('resize', () => {
      this.setState({ windowSize: windowSize() });
    });
  };

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

  checkMultipleStoreIsValidTimeToOrder = storeList => {
    let isMultipleValidTimeToOrder = false;
    for (let i = 0; i < storeList.length; i++) {
      let item = storeList[i];
      const { qrOrderingSettings } = item;

      if (Utils.isValidTimeToOrder(qrOrderingSettings)) {
        return true;
      }
    }

    return isMultipleValidTimeToOrder;
  };

  checkMultipleStoreIsPreOrderEnabled = storeList => {
    let isMultipleEnablePreOrder = false;
    for (let i = 0; i < storeList.length; i++) {
      let item = storeList[i];
      const { qrOrderingSettings } = item;
      const { enablePreOrder } = qrOrderingSettings || {};

      if (enablePreOrder) {
        return true;
      }
    }

    return isMultipleEnablePreOrder;
  };

  getStatusFromMultipleStore = () => {
    const { allStore } = this.props;
    let enablePreOrderFroMulitpeStore = false,
      isValidToOrderFromMulitpeStore = false;
    const { qrOrderingSettings } = allStore[0] || {};
    const { enablePreOrder } = qrOrderingSettings || {};

    if (allStore && allStore.length) {
      enablePreOrderFroMulitpeStore =
        allStore.length === 1 ? enablePreOrder : this.checkMultipleStoreIsPreOrderEnabled(allStore);
      isValidToOrderFromMulitpeStore =
        allStore.length === 1
          ? Utils.isValidTimeToOrder(qrOrderingSettings)
          : this.checkMultipleStoreIsValidTimeToOrder(allStore);
    }
    this.setState({
      enablePreOrderFroMulitpeStore,
      isValidToOrderFromMulitpeStore,
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

  setDefaultDate = ({ validDays = [] }) => {
    let defaultTime = new Date(); //TODO 应该用商家本地时间
    if (!validDays.length) {
      return;
    }
    let times = 0;
    const getDateStringFromTime = time => {
      time = new Date(time);
      return `${time.getFullYear()}${Utils.zero(time.getMonth() + 1)}${Utils.zero(time.getDate())}`;
    };
    const isVacation = (list, date) => {
      let isVacationDay = false;

      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        if (date >= item.vacationTimeFrom && date <= item.vacationTimeTo) {
          return true;
        }
      }
      return isVacationDay;
    };
    const currentValidDays = Array.from(validDays, v => v - 1);

    while (currentValidDays.indexOf(defaultTime.getDay()) === -1 || isVacation(getDateStringFromTime(defaultTime))) {
      times++;
      defaultTime.setDate(defaultTime.getDate() + 1);
      if (times > 30) {
        break;
      }
    }

    const currentTime = new Date(); //TODO 应该用商家本地时间

    if (defaultTime.getMonth() === currentTime.getMonth() && defaultTime.getDate() === currentTime.getDate()) {
      Utils.setSessionVariable(
        'expectedDeliveryDate',
        JSON.stringify({
          date: defaultTime.toISOString(),
          isOpen: true,
          isToday: true,
        })
      );
    } else {
      Utils.setSessionVariable(
        'expectedDeliveryDate',
        JSON.stringify({
          date: defaultTime.toISOString(),
          isOpen: true,
          isToday: false,
        })
      );
    }
  };

  setDefaultHour = ({ validTimeFrom, validTimeTo, validDays, enablePreOrder, disableOnDemandOrder }) => {
    const search = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    let deliverDate = JSON.parse(Utils.getSessionVariable('expectedDeliveryDate'));
    if (deliverDate.isToday) {
      const timeList = Utils.getHourList(validTimeFrom, validTimeTo, false, search.type, true);
      if (timeList.length) {
        let first = timeList[0];
        let expectedDeliveryHour;
        if (first === 'now') {
          if (disableOnDemandOrder) {
            first = timeList[1];
            expectedDeliveryHour = {
              from: first,
              to: Utils.zero(+first.split(':')[0] + 1) + ':00',
            };
          } else {
            expectedDeliveryHour = {
              from: 'now',
              to: 'now',
            };
          }
        } else if (enablePreOrder) {
          expectedDeliveryHour = {
            from: first,
            to: Utils.zero(+first.split(':')[0] + 1) + ':00',
          };
        }
        Utils.setSessionVariable('expectedDeliveryHour', JSON.stringify(expectedDeliveryHour));
      }
    } else {
      if (enablePreOrder) {
        const timeList = Utils.getHourList(validTimeFrom, validTimeTo, false, search.type, false);
        let first = timeList[0];
        Utils.setSessionVariable(
          'expectedDeliveryHour',
          JSON.stringify({
            from: first,
            to: Utils.zero(+first.split(':')[0] + 1) + ':00',
          })
        );
      } else {
        Utils.setSessionVariable(
          'expectedDeliveryHour',
          JSON.stringify({
            from: 'now',
            to: 'now',
          })
        );
      }
    }
  };

  checkOrderTime = async () => {
    const search = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    if ((Utils.getSessionVariable('deliveryAddress') && Utils.isDeliveryType()) || (Utils.isPickUpType() && search.h)) {
      const { businessInfo } = this.props;
      const { qrOrderingSettings } = businessInfo || {};
      // const { validTimeFrom, validTimeTo, validDays, enablePreOrder, disableOnDemandOrder } = qrOrderingSettings || {};

      if (!Utils.getSessionVariable('expectedDeliveryDate')) {
        // {"date":"2020-07-03T16:00:00.000Z","isOpen":true,"isToday":false}
        this.setDefaultDate(qrOrderingSettings || {});
      }
      if (!Utils.getSessionVariable('expectedDeliveryHour')) {
        this.setDefaultHour(qrOrderingSettings);
      }

      this.setState({
        deliveryBar: true,
      });
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

  // Remove user previously selected delivery/pickup time from session
  // Just in case the previous one they select is delivery and the new one is pickup
  // which will cause delivery/pickup time displayed in header incorrect
  handleDeliveryTimeInSession = () => {
    const { hour = {} } = Utils.getExpectedDeliveryDateFromSession();
    let previousDeliveryMethod = '';

    if (hour.from && hour.to) {
      previousDeliveryMethod = Constants.DELIVERY_METHOD.DELIVERY;
    } else if (hour.from && !hour.to) {
      previousDeliveryMethod = Constants.DELIVERY_METHOD.PICKUP;
    }

    if (
      (Utils.isPickUpType() && previousDeliveryMethod === Constants.DELIVERY_METHOD.DELIVERY) ||
      (Utils.isDeliveryType() && previousDeliveryMethod === Constants.DELIVERY_METHOD.PICKUP)
    ) {
      Utils.removeExpectedDeliveryTime();
    }
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
    const { history, deliveryInfo } = this.props;

    // table ordering situation
    if (!deliveryInfo || (!Utils.isDeliveryType() && !Utils.isPickUpType())) {
      return null;
    }

    if (isSourceBeepitCom()) {
      const source = Utils.getQueryString('source');
      sessionStorage.setItem('orderSource', source);
    }

    const isValidTimeToOrder = this.isValidTimeToOrder();
    const { enablePreOrder, deliveryToAddress } = deliveryInfo;

    const fillInDeliverToAddress = () => {
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
        content={Utils.isDeliveryType() ? deliveryToAddress : pickupAddress}
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
    const { date, hour } = Utils.getExpectedDeliveryDateFromSession();
    const locale = this.getBusinessCountry();

    if (date && hour && locale) {
      return formatToDeliveryTime({
        date: date,
        hour: hour,
        locale,
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
    const { search, enablePreOrderFroMulitpeStore } = this.state;
    const { h } = search;

    return !h ? enablePreOrderFroMulitpeStore : !!enablePreOrder;
  };

  isValidTimeToOrder = () => {
    const { deliveryInfo } = this.props;
    const { search, isValidToOrderFromMulitpeStore } = this.state;
    const { h } = search;
    const { validDays, validTimeFrom, validTimeTo, breakTimeFrom, breakTimeTo, vacations } = deliveryInfo;

    if (!Utils.isDeliveryType() && !Utils.isPickUpType()) {
      return true;
    }

    return !h
      ? isValidToOrderFromMulitpeStore
      : Utils.isValidTimeToOrder({ validDays, validTimeFrom, validTimeTo, breakTimeFrom, breakTimeTo, vacations });
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
    const { onlineStoreInfo, businessInfo, cartSummary, deliveryInfo, allStore, requestInfo } = this.props;
    const { stores, multipleStores, defaultLoyaltyRatio, enableCashback } = businessInfo || {};
    const { name } = multipleStores && stores && stores[0] ? stores[0] : {};
    const isDeliveryType = Utils.isDeliveryType();
    const isPickUpType = Utils.isPickUpType();
    // todo: we may remove legacy delivery fee in the future, since the delivery is dynamic now. For now we keep it for backward compatibility.
    const { deliveryFee: legacyDeliveryFee, storeAddress } = deliveryInfo || {};
    const deliveryFee = cartSummary ? cartSummary.shippingFee : legacyDeliveryFee;
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
        onClickHandler={isCanClickHandler ? this.handleToggleAside.bind(this) : () => {}}
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

  render() {
    const {
      categories,
      onlineStoreInfo,
      businessInfo,
      businessLoaded,
      requestInfo,
      history,
      freeDeliveryFee,
      cartSummary,
      deliveryInfo,
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

    if (!onlineStoreInfo || !categories) {
      return null;
    }

    return (
      <section className="ordering-home flex flex-column">
        {this.state.deliveryBar && this.renderDeliverToBar()}
        {this.renderHeader()}
        {enableConditionalFreeShipping && freeShippingMinAmount && Utils.isDeliveryType() ? (
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
              headerEls: [this.deliveryEntryEl, this.headerEl, this.deliveryFeeEl],
            })}px`,
            height: `${windowSize.height -
              mainTop({
                headerEls: [this.deliveryEntryEl, this.headerEl, this.deliveryFeeEl],
              }) -
              marginBottom({
                footerEls: [this.footerEl],
              })}px`,
          }}
        >
          <CurrentCategoryBar containerId="product-list" categories={categories} viewAside={viewAside} />
          <CategoryProductList
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
          />
        </div>
        <CartListAside
          footerEl={this.footerEl}
          viewAside={viewAside}
          show={viewAside === Constants.ASIDE_NAMES.CART || viewAside === Constants.ASIDE_NAMES.PRODUCT_ITEM}
          onToggle={this.handleToggleAside.bind(this, Constants.ASIDE_NAMES.CARTMODAL_HIDE)}
        />
        <ProductDetail
          footerEl={this.footerEl}
          onlineStoreInfo={onlineStoreInfo}
          show={viewAside === Constants.ASIDE_NAMES.PRODUCT_DETAIL}
          viewAside={viewAside}
          onToggle={this.handleToggleAside.bind(this)}
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
            breakTimeFrom={this.getItemFromStore(breakTimeFrom, 'breakTimeFrom')}
            breakTimeTo={this.getItemFromStore(breakTimeTo, 'breakTimeTo')}
            isValidTimeToOrder={this.isValidTimeToOrder() || this.isPreOrderEnabled()}
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
          onClickCart={this.handleToggleAside.bind(this, Constants.ASIDE_NAMES.CART)}
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
        cartSummary: getCartSummary(state),
        allStore: getStoresList(state),
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      cartActions: bindActionCreators(cartActionCreators, dispatch),
      storesActions: bindActionCreators(storesActionCreators, dispatch),
      appActions: bindActionCreators(appActionsCreators, dispatch),
    })
  )
)(Home);
