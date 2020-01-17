import React, { Component } from 'react';
import qs from 'qs';
import Footer from './components/Footer';
import Header from '../../../components/Header';
import ProductDetail from './components/ProductDetail';
import MiniCartListModal from './components/MiniCartListModal';
import CurrentCategoryBar from './components/CurrentCategoryBar';
import CategoryProductList from './components/CategoryProductList';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
      this.toggleBodyScroll(!!asideName);
    }

    this.setState({
      viewAside: asideName,
    });
  }

  renderHeader() {
    const { onlineStoreInfo, requestInfo } = this.props;
    const { tableId } = requestInfo || {};
    const classList = ['border__bottom-divider gray'];

    if (!tableId) {
      classList.push('has-right');
    }

    return (
      <Header
        className={classList.join(' ')}
        isPage={true}
        isStoreHome={true}
        logo={onlineStoreInfo.logo}
        title={onlineStoreInfo.storeName}
      >
        {tableId ? <span className="gray-font-opacity text-uppercase">Table {tableId}</span> : null}
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
          onToggle={this.handleToggleAside.bind(this)}
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

export default connect(
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
)(Home);
