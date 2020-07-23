import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import qs from 'qs';
import Footer from './components/Footer';
import Header from '../../../components/Header';

import { IconEdit, IconInfoOutline, IconLeftArrow } from '../../../components/Icons';
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
import { actions as storesActionCreators } from '../../../stores/redux/modules/home';
import { actions as appActionsCreators } from '../../redux/modules/app';
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
import locationIcon from '../../../images/beep_home_location.svg';
import { computeStraightDistance } from '../../../utils/geoUtils';
const localState = {
  blockScrollTop: 0,
};

const { DELIVERY_METHOD } = Constants;
export class Home extends Component {
  state = {
    viewAside: null,
    alcoholModal: false,
    offlineStoreModal: false,
    dScrollY: 0,
    deliveryBar: false,
    alcoholModalHide: Utils.getSessionVariable('AlcoholHide'),
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
    const { homeActions, deliveryInfo } = this.props;

    if (isSourceBeepitCom()) {
      // sync deliveryAddress from beepit.com
      await this.setupDeliveryAddressByRedirectState();
    }

    this.handleDeliveryTimeInSession();

    await homeActions.loadProductList();

    window.addEventListener('scroll', this.handleScroll);

    const pageRf = this.getPageRf();
    if (deliveryInfo && deliveryInfo.sellAlcohol && !pageRf) {
      this.setAlcoholModalState(deliveryInfo.sellAlcohol);
    }

    await this.props.appActions.loadCoreBusiness();

    if (!this.props.deliveryInfo.enablePreOrder) {
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
  };

  checkRange = () => {
    const search = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    if (search.h && Utils.getSessionVariable('deliveryAddress') && search.type === Constants.DELIVERY_METHOD.DELIVERY) {
      const { businessInfo } = this.props;
      let { stores, qrOrderingSettings } = businessInfo;
      const { deliveryRadius } = qrOrderingSettings;
      if (stores.length) {
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
    const search = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    if ((Utils.getSessionVariable('deliveryAddress') && Utils.isDeliveryType()) || (Utils.isPickUpType() && search.h)) {
      const { businessInfo } = this.props;
      const {
        validTimeFrom,
        validTimeTo,
        breakTimeFrom,
        breakTimeTo,
        validDays,
        enablePreOrder,
        disableOnDemandOrder,
      } = businessInfo.qrOrderingSettings;

      if (!Utils.getSessionVariable('expectedDeliveryDate')) {
        // {"date":"2020-07-03T16:00:00.000Z","isOpen":true,"isToday":false}

        let defaultTime = new Date(); //TODO 应该用商家本地时间
        while (true) {
          defaultTime = defaultTime.getTime();
          if (breakTimeFrom && breakTimeTo) {
            const breakTimeFromValue = new Date(breakTimeFrom).getTime();
            const breakTimeToValue = new Date(breakTimeTo).getTime();
            if (defaultTime >= breakTimeFromValue && defaultTime <= breakTimeToValue) {
              defaultTime = new Date(defaultTime + 24 * 60 * 60 * 1000);
              continue;
            }
          }
          defaultTime = new Date(defaultTime);
          if (validDays.indexOf(defaultTime.getDay()) === -1) {
            defaultTime = new Date(defaultTime + 24 * 60 * 60 * 1000);
          } else {
            break;
          }
        }
        defaultTime = new Date(defaultTime);
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
      }
      if (!Utils.getSessionVariable('expectedDeliveryHour')) {
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
    if (val && this.isCountryNeedAlcoholPop(this.getBusinessCountry())) {
      this.toggleBodyScroll(true);
    } else {
      this.toggleBodyScroll(false);
    }
  };

  componentDidUpdate(prevProps) {
    const { deliveryInfo: prevDeliveryInfo } = prevProps;
    const { deliveryInfo } = this.props;
    const pageRf = this.getPageRf();
    const { sellAlcohol } = deliveryInfo;

    if (!prevDeliveryInfo.sellAlcohol && deliveryInfo.sellAlcohol && !pageRf) {
      if (sellAlcohol) {
        this.setAlcoholModalState(sellAlcohol);
      }
    }
  }

  getPageRf = () => {
    return Utils.getQueryString('pageRefer');
  };

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

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
    const { history, deliveryInfo } = this.props;

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
          : // : Constants.ROUTER_PATHS.ORDERING_LOCATION,
            Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
        search: `${search}&callbackUrl=${callbackUrl}`,
      });
    };
    const { businessInfo } = this.props;
    const { stores = [] } = businessInfo;

    let pickupAddress = '';
    if (stores.length) pickupAddress = Utils.getValidAddress(stores[0], Constants.ADDRESS_RANGE.COUNTRY);
    // if ((isValidTimeToOrder && !(Utils.isPickUpType() && !enablePreOrder)) || (!isValidTimeToOrder && enablePreOrder)) {
    return (
      config.storeId && (
        <div
          className="location-page__entry item"
          onClick={fillInDeliverToAddress}
          data-heap-name="ordering.home.delivery-bar"
        >
          <div className="item__detail-content flex flex-top flex-space-between">
            {showBackButton({
              isValidTimeToOrder,
              enablePreOrder,
              backPosition: BackPosition.DELIVERY_TO,
            }) ? (
              <IconLeftArrow
                className="header__icon"
                data-heap-name="order.home.delivery-bar-back-btn"
                onClick={event => {
                  event.preventDefault();
                  window.location.href = this.navBackUrl;
                  event.stopPropagation();
                }}
              />
            ) : null}
            <div className="location-page__base-info">
              <p
                className="location-page__entry-address"
                style={{ fontSize: '14px', lineHeight: '22px', display: 'flex', maxHeight: '22px' }}
              >
                {' '}
                <img className="location-page__entry-address__icon" src={locationIcon} alt="" />
                {Utils.isDeliveryType() ? deliveryToAddress : pickupAddress}
              </p>

              {this.renderDeliveryDate()}
            </div>
            <IconEdit className="location-page__edit" />
          </div>
        </div>
      )
    );
    // }
    // return null;
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

  renderDeliveryDate = () => {
    const { t, deliveryInfo } = this.props;

    if (!deliveryInfo) {
      return null;
    }

    const { enablePreOrder } = deliveryInfo;
    let deliveryTimeText = t('DeliverNow');

    if (enablePreOrder) {
      deliveryTimeText = this.getExpectedDeliveryTime();
    }

    return (
      <div
        className="location-page__entry-address pick-up flex flex-middle"
        style={{
          color: '#333',
          lineHeight: '100%',
          paddingLeft: '20px',
          maxHeight: '26px',
          fontSize: '12px',
          fontWeight: '500',
        }}
      >
        <summary
          className="item__title text-uppercase font-weight-bold inline-block"
          style={{ lineHeight: '22px', fontWeight: '600', fontSize: '12px' }}
        >
          {Utils.isDeliveryType() && t('DeliverAt')}
          {Utils.isPickUpType() && t('PickUpOn')}&nbsp;.&nbsp;
          {deliveryTimeText}
        </summary>
        {/* {isPickUpType ? <IconAccessTime className="icon icon__small icon__gray text-middle flex" /> : null} */}
        {/* <span style={{fontSize: '12px', fontWeight: '600'}}></span> */}
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
        return <span className="gray-font-opacity">{t('TableIdText', { tableId })}</span>;
      case DELIVERY_METHOD.TAKE_AWAY:
        return <span className="gray-font-opacity">{t('TAKE_AWAY')}</span>;
      case DELIVERY_METHOD.DELIVERY:
      case DELIVERY_METHOD.PICKUP:
        return <IconInfoOutline className="header__info-icon" />;
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
      classList.push('border__bottom-divider gray flex-middle');
    }

    return (
      <Header
        className={classList.join(' ')}
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
    Utils.setSessionVariable('AlcoholHide', true);
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

    const { viewAside, alcoholModal } = this.state;
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
      <section className={classList.join(' ')}>
        {alcoholModal && this.isCountryNeedAlcoholPop(this.getBusinessCountry()) && !this.state.alcoholModalHide ? (
          <AlcoholModal handleLegalAge={this.handleLegalAge} country={this.getBusinessCountry()} />
        ) : null}
        {this.state.deliveryBar && this.renderDeliverToBar()}
        {this.renderHeader()}
        {enableConditionalFreeShipping &&
        freeShippingMinAmount &&
        Utils.isDeliveryType() &&
        this.state.dScrollY < adBarHeight ? (
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
        {(Utils.isDeliveryType() || Utils.isPickUpType()) && validTimeFrom && validTimeTo && (
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
        isVerticalMenu: isVerticalMenuBusiness(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        requestInfo: getRequestInfo(state),
        categories: getCategoryProductList(state),
        businessLoaded: getBusinessIsLoaded(state),
        popUpModal: getPopUpModal(state),
        cartSummary: getCartSummary(state),
        // hashcode: getStoreHashCode(state)
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
