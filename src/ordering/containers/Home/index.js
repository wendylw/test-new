import React, { Component } from 'react';
import Menu from './components/Menu';
import Footer from './components/Footer';
import Header from '../../../components/Header';
import ProductDetail from './components/ProductDetail';
import MiniCartListModal from './components/MiniCartListModal';
import CurrentCategoryBar from './components/CurrentCategoryBar';
import CategoryProductList from './components/CategoryProductList';
import qs from 'qs';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as cartActions } from '../../redux/modules/cart';
import { getOnlineStoreInfo, getRequestInfo } from '../../redux/modules/app';
import { actions as homeActions, getCategoryProductList } from '../../redux/modules/home';

const ASIDE_NAMES = {
  PRODUCT_DETAIL: 'PRODUCT_DETAIL',
  MENU: 'MENU',
  CART: 'CART'
};

const localState = {
  blockScrollTop: 0,
};

class Home extends Component {
  state = {
    viewAside: null,
  };

  componentWillMount() {
    const {
      history,
      homeActions,
      requestInfo
    } = this.props;
    const { storeId } = requestInfo;
    const { h } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    alert('storeId===>' + storeId);
    alert('h====>' + h);

    if (!storeId && !h) {
      window.location.href = '/';
    }

    homeActions.loadProductList();
  }

  toggleBodyScroll(blockScroll = false) {
    const rootEl = document.getElementById('root');
    const homeEl = document.getElementById('table-ordering-home');

    if (rootEl && homeEl) {
      rootEl.classList.toggle('fixed', blockScroll);

      if (blockScroll) {
        const currentScrollTop = document.body.scrollTop || document.documentElement.scrollTop;

        homeEl.style.top = `-${currentScrollTop}px`;

        Object.assign(localState, { blockScrollTop: currentScrollTop });
      } else {
        const { blockScrollTop } = localState;

        homeEl.style.top = null;
        document.body.scrollTop = blockScrollTop;
        document.documentElement.scrollTop = blockScrollTop;
      }
    }
  }

  handleToggleAside(asideName) {
    this.toggleBodyScroll(!!asideName);

    this.setState({
      viewAside: asideName
    });
  }

  renderHeader() {
    const {
      onlineStoreInfo,
      requestInfo,
    } = this.props;
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
        {
          tableId
            ? <span className="gray-font-opacity text-uppercase">Table {tableId}</span>
            : null
        }
      </Header>
    );
  }

  render() {
    const {
      categories,
      onlineStoreInfo,
      requestInfo,
    } = this.props;
    const { viewAside } = this.state;
    const { tableId } = requestInfo || {};

    if (!onlineStoreInfo || !categories) {
      return null;
    }

    return (
      <section className="table-ordering__home">
        {this.renderHeader()}
        <CurrentCategoryBar
          categories={categories}
        />
        <CategoryProductList onToggle={this.handleToggleAside.bind(this)} />
        <ProductDetail
          show={viewAside === ASIDE_NAMES.PRODUCT_DETAIL}
          onToggle={this.handleToggleAside.bind(this)}
        />
        <MiniCartListModal
          show={viewAside === ASIDE_NAMES.CART}
          onToggle={this.handleToggleAside.bind(this)}
        />
        <Menu
          show={viewAside === ASIDE_NAMES.MENU}
          onToggle={this.handleToggleAside.bind(this)}
        />
        <Footer
          tableId={tableId}
          onlineStoreInfo={onlineStoreInfo}
          onClickCart={this.handleToggleAside.bind(this, ASIDE_NAMES.CART)}
          onClickMenu={this.handleToggleAside.bind(this, ASIDE_NAMES.MENU)}
        />
      </section>
    );
  }
}

export default connect(
  state => {
    return {
      onlineStoreInfo: getOnlineStoreInfo(state),
      requestInfo: getRequestInfo(state),
      categories: getCategoryProductList(state),
    };
  },
  dispatch => ({
    homeActions: bindActionCreators(homeActions, dispatch),
    cartActions: bindActionCreators(cartActions, dispatch),
  }),
)(Home);
