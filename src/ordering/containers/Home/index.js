import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import qs from 'qs';
import Footer from './components/Footer';
import Header from '../../../components/Header';

import { IconEdit, IconInfoOutline, IconLeftArrow, IconAccessTime } from '../../../components/Icons';
import ProductDetail from './components/ProductDetail';
import MiniCartListModal from './components/MiniCartListModal';
import DeliveryDetailModal from './components/DeliveryDetailModal';
import CurrentCategoryBar from './components/CurrentCategoryBar';
import CategoryProductList from './components/CategoryProductList';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';
import { formatToDeliveryTime } from '../../../utils/datetime-lib';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as cartActionCreators, getBusinessInfo } from '../../redux/modules/cart';
import { getBusiness, getOnlineStoreInfo, getRequestInfo } from '../../redux/modules/app';
import { getAllBusinesses, getBusinessIsLoaded } from '../../../redux/modules/entities/businesses';
import {
  actions as homeActionCreators,
  getCategoryProductList,
  getPopUpModal,
  isVerticalMenuBusiness,
} from '../../redux/modules/home';
import CurrencyNumber from '../../components/CurrencyNumber';
import PopUpMessage from './components/PopUpMessage';
import { fetchRedirectPageState, isSourceBeepitCom } from './utils';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import config from '../../../config';

const localState = {
  blockScrollTop: 0,
};

export class Home extends Component {
  state = {
    viewAside: null,
  };

  componentDidMount = async () => {
    const { history, homeActions, requestInfo } = this.props;
    const { tableId, storeId } = requestInfo;
    const { h } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    if ((!storeId && !h) || tableId === 'DEMO') {
      window.location.href = '/';
    }

    if (isSourceBeepitCom()) {
      // sync deliveryAddress from beepit.com
      await this.setupDeliveryAddressByRedirectState();

      // Remove user previously selected delivery/pickup time from session
      // Just in case the previous one they select is delivery and the new one is pickup
      // which will cause delivery/pickup time displayed in header incorrect
      Utils.removeExpectedDeliveryTime();
    }

    homeActions.loadProductList();
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
    window.location.href = config.beepitComUrl;
  };

  handleToggleAside(asideName) {
    const stopBodyScroll =
      this.state.viewAside === Constants.ASIDE_NAMES.PRODUCT_DESCRIPTION &&
      asideName === Constants.ASIDE_NAMES.PRODUCT_DETAIL;

    if (!stopBodyScroll) {
      this.toggleBodyScroll(asideName === Constants.ASIDE_NAMES.CARTMODAL_HIDE ? false : !!asideName);
    }

    this.setState({
      viewAside: asideName,
    });
  }

  renderDeliverToBar() {
    const { t, history, business, allBusinessInfo } = this.props;
    const isValidTimeToOrder = this.isValidTimeToOrder();
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });

    if (!isValidTimeToOrder || (Utils.isPickUpType() && !enablePreOrder)) {
      return null;
    }

    const { deliveryToAddress } = this.getDeliveryInfo();
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

    return (
      <div className="location-page__entry item" onClick={isValidTimeToOrder ? fillInDeliverToAddress : () => {}}>
        <div className="item__detail-content flex flex-top flex-space-between">
          {isSourceBeepitCom() ? (
            <IconLeftArrow
              className="header__icon"
              onClick={event => {
                event.preventDefault();
                window.location.href = config.beepitComUrl;
                event.stopPropagation();
              }}
            />
          ) : null}
          <div className="location-page__base-info">
            <summary className="item__title text-uppercase font-weight-bolder">
              {Utils.isDeliveryType() && t('DeliverTo')}
              {Utils.isPickUpType() && t('PickUpOn')}
            </summary>
            {Utils.isDeliveryType() ? (
              <p className="location-page__entry-address gray-font-opacity">{deliveryToAddress}</p>
            ) : null}
            {this.renderDeliveryDate()}
          </div>
          {isValidTimeToOrder || enablePreOrder ? <IconEdit className="location-page__edit" /> : null}
        </div>
      </div>
    );
  }

  getExpectedDeliveryTime = () => {
    const { date, hour } = Utils.getExpectedDeliveryDateFromSession();
    const locale = this.getBusinessCountry();

    return formatToDeliveryTime({
      date: date,
      hour: hour,
      locale,
    });
  };

  renderDeliveryDate = () => {
    const { t, business, allBusinessInfo } = this.props;
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });
    let deliveryTimeText = t('DeliverNow');
    const isPickUpType = Utils.isPickUpType();

    if (enablePreOrder) {
      const { date = {} } = Utils.getExpectedDeliveryDateFromSession();

      deliveryTimeText = this.getExpectedDeliveryTime();

      if (!date.date) {
        deliveryTimeText = '';
      }
    }

    return (
      <div className="location-page__entry-address pick-up flex flex-middle">
        {isPickUpType ? <IconAccessTime className="icon icon__small icon__gray text-middle" /> : null}
        <p className="gray-font-opacity">{deliveryTimeText}</p>
      </div>
    );
  };

  isPreOrderEnabled = () => {
    const { enablePreOrder } = this.getDeliveryInfo();

    return enablePreOrder;
  };

  isValidTimeToOrder = () => {
    if (!Utils.isDeliveryType() && !Utils.isPickUpType()) {
      return true;
    }

    const { validDays, validTimeFrom, validTimeTo } = this.getDeliveryInfo();

    return Utils.isValidTimeToOrder({ validDays, validTimeFrom, validTimeTo });
  };

  getDeliveryInfo = () => {
    const { allBusinessInfo, business } = this.props;

    return Utils.getDeliveryInfo({ business, allBusinessInfo });
  };

  renderHeader() {
    const { t, onlineStoreInfo, businessInfo, requestInfo, cartSummary } = this.props;
    const { stores, multipleStores, defaultLoyaltyRatio, enableCashback } = businessInfo || {};
    const { tableId } = requestInfo || {};
    const { name } = multipleStores && stores && stores[0] ? stores[0] : {};
    const classList = [];
    const isDeliveryType = Utils.isDeliveryType();
    const isPickUpType = Utils.isPickUpType();
    // todo: we may remove legacy delivery fee in the future, since the delivery is dynamic now. For now we keep it for backward compatibility.
    const { deliveryFee: legacyDeliveryFee, storeAddress } = this.getDeliveryInfo();
    const deliveryFee = cartSummary ? cartSummary.shippingFee : legacyDeliveryFee;

    if (!tableId && !(isDeliveryType || isPickUpType)) {
      classList.push('has-right');
    }

    if (isDeliveryType || isPickUpType) {
      classList.push('flex-top');
    } else {
      classList.push('border__bottom-divider gray flex-middle');
    }

    return (
      <Header
        className={classList.join(' ')}
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
        {tableId ? <span className="gray-font-opacity">{t('TableIdText', { tableId })}</span> : null}
        {isDeliveryType || isPickUpType ? <IconInfoOutline className="header__info-icon" /> : null}
      </Header>
    );
  }

  renderProOrderConfirmModal = () => {
    const { popUpModal, t } = this.props;
    const { validTimeFrom, validTimeTo } = this.getDeliveryInfo();

    if (this.isPreOrderEnabled() && !this.isValidTimeToOrder() && !popUpModal.userConfirmed) {
      return (
        <PopUpMessage
          title={t('PreOrderConfirmModalTitle')}
          description={t('PreOrderConfirmModalDescription', {
            validTimeFrom: Utils.formatTimeWithColon(validTimeFrom),
            validTimeTo: Utils.formatTimeWithColon(validTimeTo),
          })}
          containerClass="pre-order__modal"
          button={
            <button
              className="button button__fill button__block font-weight-bolder border-radius-base text-uppercase"
              onClick={this.props.homeActions.userConfirmPreOrder}
            >
              {t('Okay')}
            </button>
          }
        />
      );
    }
    return null;
  };

  render() {
    const {
      business,
      categories,
      onlineStoreInfo,
      businessInfo,
      businessLoaded,
      requestInfo,
      isVerticalMenu,
      allBusinessInfo,
      history,
      freeDeliveryFee,
      cartSummary,
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
    } = this.getDeliveryInfo();

    const { viewAside } = this.state;
    const { tableId } = requestInfo || {};
    const classList = ['table-ordering__home'];

    if (!onlineStoreInfo || !categories) {
      return null;
    }

    if (Utils.isDeliveryType() || Utils.isPickUpType()) {
      classList.push('location-page__entry-container');
    }

    return (
      <section className={classList.join(' ')}>
        {/* {Utils.isDeliveryType() ? this.renderDeliverToBar() : null} */}
        {this.renderDeliverToBar()}
        {this.renderHeader()}
        {enableConditionalFreeShipping && freeShippingMinAmount && Utils.isDeliveryType() ? (
          <div className="top-message__second-level text-center">
            <Trans i18nKey="FreeDeliveryPrompt" freeShippingMinAmount={freeShippingMinAmount}>
              <span>
                Free Delivery with <CurrencyNumber money={freeShippingMinAmount || 0} /> & above
              </span>
            </Trans>
          </div>
        ) : null}
        <CurrentCategoryBar categories={categories} isVerticalMenu={isVerticalMenu} />
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
        ) : null}
        <Footer
          {...otherProps}
          onToggle={this.handleToggleAside.bind(this)}
          tableId={tableId}
          onClickCart={this.handleToggleAside.bind(this, Constants.ASIDE_NAMES.CART)}
          isValidTimeToOrder={this.isValidTimeToOrder()}
          history={history}
          isLiveOnline={enableLiveOnline}
          enablePreOrder={this.isPreOrderEnabled()}
        />
        {this.renderProOrderConfirmModal()}
      </section>
    );
  }
}

export default compose(
  withTranslation(['OrderingHome']),
  connect(
    state => {
      return {
        business: getBusiness(state),
        businessInfo: getBusinessInfo(state),
        isVerticalMenu: isVerticalMenuBusiness(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        requestInfo: getRequestInfo(state),
        categories: getCategoryProductList(state),
        allBusinessInfo: getAllBusinesses(state),
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
