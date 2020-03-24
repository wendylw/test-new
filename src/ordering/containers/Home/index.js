import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import qs from 'qs';
import Footer from './components/Footer';
import Header from '../../../components/Header';

import { IconEdit, IconInfoOutline } from '../../../components/Icons';
import ProductDetail from './components/ProductDetail';
import MiniCartListModal from './components/MiniCartListModal';
import DeliveryDetailModal from './components/DeliveryDetailModal';
import CurrentCategoryBar from './components/CurrentCategoryBar';
import CategoryProductList from './components/CategoryProductList';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as cartActionCreators, getBusinessInfo } from '../../redux/modules/cart';
import { getBusiness, getOnlineStoreInfo, getRequestInfo } from '../../redux/modules/app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import {
  actions as homeActionCreators,
  getCategoryProductList,
  isVerticalMenuBusiness,
} from '../../redux/modules/home';
import CurrencyNumber from '../../components/CurrencyNumber';

const localState = {
  blockScrollTop: 0,
};

export class Home extends Component {
  state = {
    viewAside: null,
  };

  componentDidMount() {
    const { history, homeActions, requestInfo } = this.props;
    const { storeId } = requestInfo;
    const { h } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    if (!storeId && !h) {
      window.location.href = '/';
    }

    homeActions.loadProductList();
  }

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
    const { t, history } = this.props;
    const { deliveryToAddress } = this.getDeliveryInfo();
    const isValidTimeToOrder = this.isValidTimeToOrder();
    const fillInDeliverToAddress = () => {
      const { search } = window.location;

      Utils.setSessionVariable('deliveryCallbackUrl', `/${search}`);

      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION,
        search,
      });
    };

    return (
      <div className="location-page__entry item" onClick={isValidTimeToOrder ? fillInDeliverToAddress : () => {}}>
        <div className="item__detail-content flex flex-middle flex-space-between">
          <div className="location-page__base-info">
            <summary className="item__title">{t('DeliverTo')}</summary>
            <p className="location-page__entry-address gray-font-opacity">{deliveryToAddress}</p>
          </div>
          <i className="location-page__edit">{isValidTimeToOrder ? <IconEdit /> : null}</i>
        </div>
      </div>
    );
  }

  isValidTimeToOrder = () => {
    // if (!Utils.isDeliveryType()) {
    //   return true;
    // }
    // let { validDays, validTimeFrom, validTimeTo } = this.getDeliveryInfo();
    // const weekInfo = new Date().getDay() + 1;
    // const hourInfo = new Date().getHours();
    // const minutesInfo = new Date().getMinutes();
    // const timeFrom = validTimeFrom ? validTimeFrom.split(':') : ['00', '00'];
    // const timeTo = validTimeTo ? validTimeTo.split(':') : ['23', '59'];

    // const isClosed =
    //   hourInfo < Number(timeFrom[0]) ||
    //   hourInfo > Number(timeTo[0]) ||
    //   (hourInfo === Number(timeFrom[0]) &&
    //     (minutesInfo < Number(timeFrom[1]) || minutesInfo === Number(timeFrom[1]))) ||
    //   (hourInfo === Number(timeTo[0]) && (minutesInfo > Number(timeTo[1]) || minutesInfo === Number(timeTo[1])));

    // if (validDays && validDays.includes(weekInfo) && !isClosed) {
    //   return true;
    // } else {
    //   return false;
    // }

    if (!Utils.isDeliveryType() && !Utils.isPickUpType()) {
      return true;
    }

    const { validDays, validTimeFrom, validTimeTo } = this.getDeliveryInfo();

    return Utils.isValidTimeToOrder({ validDays, validTimeFrom, validTimeTo });
  };

  getDeliveryInfo = () => {
    const { allBusinessInfo, business } = this.props;
    return Utils.getDeliveryInfo({ business, allBusinessInfo });
    // const originalInfo = allBusinessInfo[business] || {};
    // const { stores } = originalInfo || {};
    // const { qrOrderingSettings } = originalInfo || {};
    // const { defaultShippingZone, minimumConsumption, validDays, validTimeFrom, validTimeTo } = qrOrderingSettings || {};
    // const { defaultShippingZoneMethod } = defaultShippingZone || {};
    // const { rate } = defaultShippingZoneMethod || {};
    // const deliveryFee = rate || 0;
    // const minOrder = minimumConsumption || 0;

    // const { phone } = (stores && stores[0]) || {};
    // const storeAddress = Utils.getValidAddress((stores && stores[0]) || {}, Constants.ADDRESS_RANGE.COUNTRY);
    // const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');

    // return {
    //   deliveryFee,
    //   minOrder,
    //   storeAddress,
    //   deliveryToAddress,
    //   telephone: phone,
    //   validDays,
    //   validTimeFrom,
    //   validTimeTo,
    // };
  };

  renderHeader() {
    const { t, onlineStoreInfo, businessInfo, requestInfo } = this.props;
    const { stores, multipleStores } = businessInfo || {};
    const { tableId } = requestInfo || {};
    const { name } = multipleStores && stores && stores[0] ? stores[0] : {};
    const classList = [];
    const isDeliveryType = Utils.isDeliveryType();
    const { deliveryFee, minOrder } = this.getDeliveryInfo();

    if (!tableId && !isDeliveryType) {
      classList.push('has-right');
    }

    if (!isDeliveryType) {
      classList.push('border__bottom-divider gray');
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
        minOrder={minOrder}
        isValidTimeToOrder={this.isValidTimeToOrder()}
      >
        {tableId ? <span className="gray-font-opacity text-uppercase">{t('TableIdText', { tableId })}</span> : null}
        {isDeliveryType ? (
          <i className="header__info-icon">
            <IconInfoOutline />
          </i>
        ) : null}
      </Header>
    );
  }

  render() {
    const {
      business,
      categories,
      onlineStoreInfo,
      businessInfo,
      requestInfo,
      isVerticalMenu,
      allBusinessInfo,
      history,
      freeDeliveryFee,
      ...otherProps
    } = this.props;
    const {
      deliveryFee,
      minOrder,
      storeAddress,
      telephone,
      validDays,
      validTimeFrom,
      validTimeTo,
      freeShippingMinAmount,
      enableConditionalFreeShipping,
    } = this.getDeliveryInfo();

    const { viewAside } = this.state;
    const { tableId } = requestInfo || {};
    const classList = ['table-ordering__home'];

    if (!onlineStoreInfo || !categories) {
      return null;
    }

    if (Utils.isDeliveryType()) {
      classList.push('location-page__entry-container');
    }

    return (
      <section className={classList.join(' ')}>
        {Utils.isDeliveryType() ? this.renderDeliverToBar() : null}
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
          isValidTimeToOrder={this.isValidTimeToOrder()}
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
        <DeliveryDetailModal
          onlineStoreInfo={onlineStoreInfo}
          businessInfo={businessInfo}
          show={viewAside === Constants.ASIDE_NAMES.DELIVERY_DETAIL}
          onToggle={this.handleToggleAside.bind(this)}
          deliveryFee={deliveryFee}
          minOrder={minOrder}
          storeAddress={storeAddress}
          telephone={telephone}
          validDays={validDays}
          validTimeFrom={validTimeFrom}
          validTimeTo={validTimeTo}
          isValidTimeToOrder={this.isValidTimeToOrder()}
        />
        {!this.isValidTimeToOrder() ? (
          <div className={`cover back-drop ${Utils.isPickUpType() ? 'pickup' : ''}`}></div>
        ) : null}
        <Footer
          {...otherProps}
          onToggle={this.handleToggleAside.bind(this)}
          tableId={tableId}
          onClickCart={this.handleToggleAside.bind(this, Constants.ASIDE_NAMES.CART)}
          isValidTimeToOrder={this.isValidTimeToOrder()}
          history={history}
        />
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
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      cartActions: bindActionCreators(cartActionCreators, dispatch),
    })
  )
)(Home);
