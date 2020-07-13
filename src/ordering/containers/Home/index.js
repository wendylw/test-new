import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withTranslation, Trans } from 'react-i18next';
import qs from 'qs';
import Footer from './components/Footer';
import Header from '../../../components/Header';

import { IconEdit, IconInfoOutline, IconAccessTime, IconLocation } from '../../../components/Icons';
import DeliverToBar from '../../../components/DeliverToBar';
import ProductDetail from './components/ProductDetail';
import MiniCartListModal from './components/MiniCartListModal';
import DeliveryDetailModal from './components/DeliveryDetailModal';
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
import { getOnlineStoreInfo, getRequestInfo } from '../../redux/modules/app';
import { getBusinessIsLoaded } from '../../../redux/modules/entities/businesses';
import {
  actions as homeActionCreators,
  getCategoryProductList,
  getDeliveryInfo,
  getPopUpModal,
  isVerticalMenuBusiness,
} from '../../redux/modules/home';
import CurrencyNumber from '../../components/CurrencyNumber';
import { fetchRedirectPageState, isSourceBeepitCom } from './utils';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import config from '../../../config';
import { BackPosition, showBackButton } from '../../../utils/backHelper';
import './OrderingHome.scss';

const localState = {
  blockScrollTop: 0,
};

const { DELIVERY_METHOD } = Constants;
export class Home extends Component {
  deliveryEntryEl = null;
  headerEl = null;
  footerEl = null;

  state = {
    viewAside: null,
    alcoholModal: false,
    offlineStoreModal: false,
    dScrollY: 0,
    containerHeight: null,
  };

  handleScroll = () => {
    const documentScrollY = document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset;
    this.setState({
      dScrollY: documentScrollY,
    });
  };

  get navBackUrl() {
    const source = Utils.getQueryString('source');
    if (source) {
      return source;
    }
    return config.beepitComUrl;
  }

  componentDidMount = async () => {
    const { history, homeActions, requestInfo, deliveryInfo } = this.props;
    const { tableId, storeId } = requestInfo;
    const { h } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    if (!h || !storeId || tableId === 'DEMO') {
      window.location.href = '/';
    }

    if (isSourceBeepitCom()) {
      // sync deliveryAddress from beepit.com
      await this.setupDeliveryAddressByRedirectState();
    }

    this.handleDeliveryTimeInSession();

    homeActions.loadProductList();
    window.addEventListener('scroll', this.handleScroll);

    const pageRf = this.getPageRf();
    if (deliveryInfo && deliveryInfo.sellAlcohol && !pageRf) {
      this.setAlcoholModalState(deliveryInfo.sellAlcohol);
    }

    if (
      ReactDOM.findDOMNode(this.deliveryEntryEl) &&
      ReactDOM.findDOMNode(this.headerEl) &&
      ReactDOM.findDOMNode(this.footerEl)
    ) {
      this.setMainContainerHeight();
    }
  };

  setAlcoholModalState = val => {
    this.setState({
      alcoholModal: val,
    });
    if (val && this.isCountryNeedAlcoholPop(this.getBusinessCountry())) {
      this.toggleBodyScroll(true);
    } else {
      this.toggleBodyScroll(false);
    }
  };

  componentDidUpdate(prevProps, prevState) {
    const { deliveryInfo: prevDeliveryInfo } = prevProps;
    const { containerHeight } = prevState;
    const { deliveryInfo } = this.props;
    const pageRf = this.getPageRf();
    if (!prevDeliveryInfo.sellAlcohol && deliveryInfo.sellAlcohol && !pageRf) {
      const { sellAlcohol } = deliveryInfo;
      if (sellAlcohol) {
        this.setAlcoholModalState(sellAlcohol);
      }
    }

    if (!containerHeight) {
      this.setMainContainerHeight();
    }
  }

  getPageRf = () => {
    return Utils.getQueryString('pageRefer');
  };

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  setMainContainerHeight = () => {
    const isValid =
      ReactDOM.findDOMNode(this.deliveryEntryEl) &&
      ReactDOM.findDOMNode(this.headerEl) &&
      ReactDOM.findDOMNode(this.footerEl);

    if (isValid) {
      this.setState({
        containerHeight: `${Utils.getContainerElementHeight(
          [ReactDOM.findDOMNode(this.deliveryEntryEl), ReactDOM.findDOMNode(this.headerEl)],
          ReactDOM.findDOMNode(this.footerEl)
        )}px`,
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
        rootEl.setAttribute('class', `${rootClassName} fixed`);
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
    const stopBodyScroll =
      this.state.viewAside === Constants.ASIDE_NAMES.PRODUCT_DESCRIPTION &&
      asideName === Constants.ASIDE_NAMES.PRODUCT_DETAIL;

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
    const { t, history, deliveryInfo } = this.props;

    if (!deliveryInfo) {
      return null;
    }

    // table ordering situation
    if (!Utils.isDeliveryType() && !Utils.isPickUpType()) {
      return null;
    }

    const isValidTimeToOrder = this.isValidTimeToOrder();
    const { enablePreOrder, deliveryToAddress } = deliveryInfo;

    const fillInDeliverToAddress = () => {
      const { search } = window.location;
      const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_HOME}${search}`);

      history.push({
        pathname: enablePreOrder
          ? Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE
          : Constants.ROUTER_PATHS.ORDERING_LOCATION,
        search: `${search}&callbackUrl=${callbackUrl}`,
      });
    };

    if ((isValidTimeToOrder && !(Utils.isPickUpType() && !enablePreOrder)) || (!isValidTimeToOrder && enablePreOrder)) {
      return (
        <DeliverToBar
          deliverToBarRef={ref => (this.deliveryEntryEl = ref)}
          heapContentName="ordering.home.delivery-bar"
          heapBackButtonName="order.home.delivery-bar-back-btn"
          className="ordering-home__deliver-to"
          title={Utils.isDeliveryType() ? t('DeliverTo') : t('PickUpOn')}
          content={Utils.isDeliveryType() ? deliveryToAddress : this.getExpectedDeliveryTime()}
          navBackUrl={this.navBackUrl}
          extraInfo={
            Utils.isDeliveryType() ? (!enablePreOrder ? t('DeliverNow') : this.getExpectedDeliveryTime()) : null
          }
          showBackButton={showBackButton({
            isValidTimeToOrder,
            enablePreOrder,
            backPosition: BackPosition.DELIVERY_TO,
          })}
          gotoLocationPage={fillInDeliverToAddress}
          icon={
            Utils.isDeliveryType() ? (
              <IconLocation className="icon icon__smaller text-middle flex__shrink-fixed" />
            ) : (
              <IconAccessTime className="icon icon__smaller text-middle flex__shrink-fixed" />
            )
          }
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

    return null;
  }

  getExpectedDeliveryTime = () => {
    const { date, hour } = Utils.getExpectedDeliveryDateFromSession();
    const locale = this.getBusinessCountry();

    if (date && hour && locale) {
      return formatToDeliveryTime({
        date: date,
        hour: hour,
        locale,
      });
    }

    return '';
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
        <IconAccessTime className="icon icon__smaller text-middle flex__shrink-fixed" />
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
    return !!enablePreOrder;
  };

  isValidTimeToOrder = () => {
    const { deliveryInfo } = this.props;

    if (!Utils.isDeliveryType() && !Utils.isPickUpType()) {
      return true;
    }

    const { validDays, validTimeFrom, validTimeTo } = deliveryInfo;

    return Utils.isValidTimeToOrder({ validDays, validTimeFrom, validTimeTo });
  };

  renderHeaderChildren() {
    const { requestInfo, t } = this.props;
    const type = Utils.getOrderTypeFromUrl();
    switch (type) {
      case DELIVERY_METHOD.DINE_IN:
        const { tableId } = requestInfo || {};
        return (
          <span className="flex__shrink-fixed flex__shrink-fixed text-opacity">{t('TableIdText', { tableId })}</span>
        );
      case DELIVERY_METHOD.TAKE_AWAY:
        return <span className="flex__shrink-fixed padding-normal text-opacity">{t('TAKE_AWAY')}</span>;
      case DELIVERY_METHOD.DELIVERY:
      case DELIVERY_METHOD.PICKUP:
        return <IconInfoOutline className="icon icon__big text-middle flex__shrink-fixed" />;
      default:
        return null;
    }
  }

  renderHeader() {
    const { onlineStoreInfo, businessInfo, cartSummary, deliveryInfo } = this.props;
    const { stores, multipleStores, defaultLoyaltyRatio, enableCashback } = businessInfo || {};
    const { name } = multipleStores && stores && stores[0] ? stores[0] : {};
    const classList = [];
    const isDeliveryType = Utils.isDeliveryType();
    const isPickUpType = Utils.isPickUpType();
    // todo: we may remove legacy delivery fee in the future, since the delivery is dynamic now. For now we keep it for backward compatibility.
    const { deliveryFee: legacyDeliveryFee, storeAddress } = deliveryInfo || {};
    const deliveryFee = cartSummary ? cartSummary.shippingFee : legacyDeliveryFee;

    if (isDeliveryType || isPickUpType) {
      classList.push('flex-top');
    } else {
      classList.push('flex-middle border__bottom-divider');
    }

    return (
      <Header
        headerRef={ref => (this.headerEl = ref)}
        className={classList.join(' ')}
        style={{ top: this.deliveryEntryEl ? `${this.deliveryEntryEl.clientHeight}px` : 0 }}
        data-heap-name="ordering.home.header"
        isPage={true}
        isStoreHome={true}
        logo={onlineStoreInfo.logo}
        title={`${onlineStoreInfo.storeName}${name ? ` (${name})` : ''}`}
        onClickHandler={this.handleToggleAside.bind(this)}
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
    // this.setState({
    //   alcoholModal: !isAgeLegal,
    // });
    this.setAlcoholModalState(!isAgeLegal);
  };
  isCountryNeedAlcoholPop = country => {
    if (country === 'TH' || country === 'SG') return false;
    return true;
  };

  render() {
    const {
      categories,
      onlineStoreInfo,
      businessInfo,
      businessLoaded,
      requestInfo,
      isVerticalMenu,
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
    } = deliveryInfo;

    const { viewAside, alcoholModal, containerHeight } = this.state;
    const { tableId } = requestInfo || {};
    const classList = ['table-ordering__home'];
    const adBarHeight = 30;

    if (!onlineStoreInfo || !categories) {
      return null;
    }

    if (Utils.isDeliveryType() || Utils.isPickUpType()) {
      classList.push('location-page__entry-container');
    }

    return (
      <React.Fragment>
        {this.renderDeliverToBar()}
        {this.renderHeader()}
        {enableConditionalFreeShipping &&
        freeShippingMinAmount &&
        Utils.isDeliveryType() &&
        this.state.dScrollY < adBarHeight ? (
          <Trans i18nKey="FreeDeliveryPrompt" freeShippingMinAmount={freeShippingMinAmount}>
            <p className="ordering-home__delivery-fee padding-small text-center">
              Free Delivery with <CurrencyNumber money={freeShippingMinAmount || 0} /> & above
            </p>
          </Trans>
        ) : null}

        <div
          className="ordering-home fixed-wrapper__container wrapper"
          style={containerHeight ? { height: containerHeight } : null}
        >
          <CurrentCategoryBar categories={categories} isVerticalMenu={isVerticalMenu} />
          {/* 
          <CategoryProductList
            isVerticalMenu={isVerticalMenu}
            onToggle={this.handleToggleAside.bind(this)}
            onShowCart={this.handleToggleAside.bind(this, Constants.ASIDE_NAMES.PRODUCT_ITEM)}
            isValidTimeToOrder={this.isValidTimeToOrder() || this.isPreOrderEnabled()}
          />
          <ProductDetail
            onlineStoreInfo={onlineStoreInfo}
            show={
              viewAside === Constants.ASIDE_NAMES.PRODUCT_DETAIL ||
              viewAside === Constants.ASIDE_NAMES.PRODUCT_DESCRIPTION
            }
            viewAside={viewAside}
            onToggle={this.handleToggleAside.bind(this)}
          />
          <MiniCartListModal
            viewAside={viewAside}
            show={viewAside === Constants.ASIDE_NAMES.CART || viewAside === Constants.ASIDE_NAMES.PRODUCT_ITEM}
            onToggle={this.handleToggleAside.bind(this, Constants.ASIDE_NAMES.CARTMODAL_HIDE)}
          />
          {!Utils.isDeliveryType() && !Utils.isPickUpType() ? null : (
            <DeliveryDetailModal
              onlineStoreInfo={onlineStoreInfo}
              businessInfo={businessInfo}
              businessLoaded={businessLoaded}
              show={viewAside === Constants.ASIDE_NAMES.DELIVERY_DETAIL}
              onToggle={this.handleToggleAside.bind(this)}
              storeAddress={storeAddress}
              telephone={telephone}
              validDays={validDays}
              validTimeFrom={validTimeFrom}
              validTimeTo={validTimeTo}
              isValidTimeToOrder={this.isValidTimeToOrder() || this.isPreOrderEnabled()}
            />
          )}
          {!this.isValidTimeToOrder() && !this.isPreOrderEnabled() ? (
            <div className={`cover back-drop ${Utils.isPickUpType() ? 'pickup' : ''}`}></div>
          ) : null} */}
        </div>
        <Footer
          {...otherProps}
          footerRef={ref => (this.footerEl = ref)}
          onToggle={this.handleToggleAside.bind(this)}
          tableId={tableId}
          onClickCart={this.handleToggleAside.bind(this, Constants.ASIDE_NAMES.CART)}
          isValidTimeToOrder={this.isValidTimeToOrder()}
          history={history}
          isLiveOnline={enableLiveOnline}
          enablePreOrder={this.isPreOrderEnabled()}
        />
        {alcoholModal && this.isCountryNeedAlcoholPop(this.getBusinessCountry()) ? (
          <AlcoholModal handleLegalAge={this.handleLegalAge} country={this.getBusinessCountry()} />
        ) : null}
        {this.renderOfflineModal(enableLiveOnline)}
      </React.Fragment>
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
        isVerticalMenu: isVerticalMenuBusiness(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        requestInfo: getRequestInfo(state),
        categories: getCategoryProductList(state),
        businessLoaded: getBusinessIsLoaded(state),
        popUpModal: getPopUpModal(state),
        cartSummary: getCartSummary(state),
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      cartActions: bindActionCreators(cartActionCreators, dispatch),
    })
  )
)(Home);
