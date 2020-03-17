import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
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
import { actions as cartActionCreators } from '../../redux/modules/cart';
import { getBusiness, getOnlineStoreInfo, getRequestInfo } from '../../redux/modules/app';
import {
  actions as homeActionCreators,
  getCategoryProductList,
  isVerticalMenuBusiness,
} from '../../redux/modules/home';

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
    const { t, deliveryToAddress } = this.props;
    const fillInDelivertAddress = () => {
      const search = window.location.search;
      window.location.href = `${Constants.ROUTER_PATHS.ORDERING_BASE}${Constants.ROUTER_PATHS.ORDERING_LOCATION}${search}`;
    };
    return (
      <div className="location-page__entry item" onClick={fillInDelivertAddress}>
        <div className="item__detail-content flex flex-middle flex-space-between">
          <div className="location-page__base-info">
            <summary className="item__title">{t('DeliverTo')}</summary>
            <p className="location-page__entry-address gray-font-opacity">{deliveryToAddress}</p>
          </div>
          <i className="location-page__edit">
            <IconEdit />
          </i>
        </div>
      </div>
    );
  }
  isDeliveryType = () => {
    //return true;
    const type = Utils.getQueryString('type');
    return type === 'delivery';
  };

  renderHeader() {
    const { t, onlineStoreInfo, requestInfo, deliveryFee, minOrder } = this.props;
    const { tableId } = requestInfo || {};
    const classList = ['border__bottom-divider gray'];
    const isDeliveryType = this.isDeliveryType();
    // TODO: judge is delivery
    if (!tableId) {
      // classList.push('has-right');
    }

    return (
      <Header
        className={classList.join(' ')}
        isPage={true}
        isStoreHome={true}
        logo={onlineStoreInfo.logo}
        title={onlineStoreInfo.storeName}
        onClickHandler={this.handleToggleAside.bind(this)}
        isDeliveryType={isDeliveryType}
        deliveryFee={deliveryFee}
        minOrder={minOrder}
      >
        {tableId ? <span className="gray-font-opacity text-uppercase">{t('TableIdText', { tableId })}</span> : null}
        {/* TODO: judge is delivery */}

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
      requestInfo,
      isVerticalMenu,
      deliveryFee,
      minOrder,
      telephone,
      storeAddress,
      deliveryHour,
      ...otherProps
    } = this.props;
    const { viewAside } = this.state;
    const { tableId } = requestInfo || {};

    if (!onlineStoreInfo || !categories) {
      return null;
    }

    return (
      <section className="table-ordering__home">
        {this.isDeliveryType() ? this.renderDeliverToBar() : null}
        {this.renderHeader()}
        <CurrentCategoryBar categories={categories} isVerticalMenu={isVerticalMenu} />
        <CategoryProductList
          isVerticalMenu={isVerticalMenu}
          onToggle={this.handleToggleAside.bind(this)}
          onShowCart={this.handleToggleAside.bind(this, Constants.ASIDE_NAMES.PRODUCT_ITEM)}
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
          show={viewAside === Constants.ASIDE_NAMES.DELIVERY_DETAIL}
          onToggle={this.handleToggleAside.bind(this)}
          deliveryFee={deliveryFee}
          minOrder={minOrder}
          storeAddress={storeAddress}
          telephone={telephone}
          deliveryHour={deliveryHour}
        />
        <Footer
          {...otherProps}
          onToggle={this.handleToggleAside.bind(this)}
          tableId={tableId}
          onClickCart={this.handleToggleAside.bind(this, Constants.ASIDE_NAMES.CART)}
        />
      </section>
    );
  }
}

/* TODO: backend data */
export default compose(
  withTranslation(['OrderingHome']),
  connect(
    state => {
      return {
        business: getBusiness(state),
        isVerticalMenu: isVerticalMenuBusiness(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        requestInfo: getRequestInfo(state),
        categories: getCategoryProductList(state),
        deliveryFee: 5.5,
        minOrder: 21,
        deliveryToAddress: 'Unit C-3, 10 Boulevard, Leburhraya Sprint, PJU 6A, 47400 Peta',
        storeAddress: ' 34, Jalan Ambong 4, Kepong Baru, 52100 Kuala Lumpur',
        telephone: '+60 012 98765432',
        deliveryHour: [1, 2, 3, 4, 5, 6],
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      cartActions: bindActionCreators(cartActionCreators, dispatch),
    })
  )
)(Home);
