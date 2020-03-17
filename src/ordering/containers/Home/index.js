import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import qs from 'qs';
import Footer from './components/Footer';
import Header from '../../../components/Header';
import Tag from '../../../components/Tag';
import Image from '../../../components/Image';
import { IconEdit, IconInfoOutline, IconMotorcycle } from '../../../components/Icons';
import ProductDetail from './components/ProductDetail';
import MiniCartListModal from './components/MiniCartListModal';
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
    const { t } = this.props;

    return (
      <div className="location-page__entry item">
        <div className="item__detail-content flex flex-middle flex-space-between">
          <div className="location-page__base-info">
            <summary className="item__title">{t('DeliverTo')}</summary>
            <p className="location-page__entry-address gray-font-opacity">
              Unit C-3, 10 Boulevard, Leburhraya Sprint, PJU 6A, 47400 Peta
            </p>
          </div>
          <i className="location-page__edit">
            <IconEdit />
          </i>
        </div>
      </div>
    );
  }

  renderHeader() {
    const { t, onlineStoreInfo, requestInfo } = this.props;
    const { tableId } = requestInfo || {};
    const classList = ['border__bottom-divider gray'];

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
      >
        {tableId ? <span className="gray-font-opacity text-uppercase">{t('TableIdText', { tableId })}</span> : null}
        {/* TODO: judge is delivery */}
        <i className="header__info-icon">
          <IconInfoOutline />
        </i>
      </Header>
    );
  }

  render() {
    const { business, categories, onlineStoreInfo, requestInfo, isVerticalMenu, ...otherProps } = this.props;
    const { viewAside } = this.state;
    const { tableId } = requestInfo || {};

    if (!onlineStoreInfo || !categories) {
      return null;
    }

    return (
      <section className="table-ordering__home">
        {this.renderDeliverToBar()}
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
        <aside className="aside active">
          <div className="store-info">
            <i className="aside-bottom__slide-button"></i>

            <div className="flex flex-top flex-space-between">
              <Image
                className="header__image-container text-middle"
                src={onlineStoreInfo.logo}
                alt={onlineStoreInfo.title}
              />
              <div className="header__title-container">
                <h1 className="header__title">
                  <span className="font-weight-bold text-middle">{onlineStoreInfo.storeName}</span>
                  <div className="tag__card-container">
                    <Tag text="Closed" className="tag__card warning downsize text-middle"></Tag>
                  </div>
                </h1>
                <p className="store-info__address gray-font-opacity">
                  34, Jalan Ambong 4, Kepong Baru, 52100 Kuala Lumpur
                </p>
                <a className="store-info__phone link link__non-underline" href="tel:+6001298765432">
                  +60 012 98765432
                </a>
                <ul className="header__info-list">
                  <li className="header__info-item">
                    <i className="header__motor-icon text-middle">
                      <IconMotorcycle />
                    </i>
                    <span className="text-middle">RM 5.00</span>
                  </li>
                  <li className="header__info-item">
                    <span>Min Order. RM 20.00</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="store-info__delivery-hours flex flex-top flex-space-between">
              <label className="font-weight-bold gray-font-opacity">Delivery Hours</label>
              <ul className="store-info__list">
                <li className="store-info__item flex flex-middle flex-space-between">
                  <span>Sun</span>
                  <time>11:00 - 22:30</time>
                </li>
                <li className="store-info__item flex flex-middle flex-space-between">
                  <span>Sun</span>
                  <time>11:00 - 22:30</time>
                </li>
                <li className="store-info__item flex flex-middle flex-space-between">
                  <span>Sun</span>
                  <time>11:00 - 22:30</time>
                </li>
                <li className="store-info__item flex flex-middle flex-space-between">
                  <span>Sun</span>
                  <time>11:00 - 22:30</time>
                </li>
                <li className="store-info__item flex flex-middle flex-space-between">
                  <span>Sun</span>
                  <time>11:00 - 22:30</time>
                </li>
                <li className="store-info__item flex flex-middle flex-space-between">
                  <span>Sun</span>
                  <time>11:00 - 22:30</time>
                </li>
                <li className="store-info__item flex flex-middle flex-space-between">
                  <span>Sun</span>
                  <time>11:00 - 22:30</time>
                </li>
              </ul>
            </div>
          </div>
        </aside>
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
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      cartActions: bindActionCreators(cartActionCreators, dispatch),
    })
  )
)(Home);
