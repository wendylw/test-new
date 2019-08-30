import React, { Component } from 'react';
import Menu from './components/Menu';
import Footer from './components/Footer';
import Header from '../../components/Header';
import ProductDetail from './components/ProductDetail';
import MiniCartListModal from './components/MiniCartListModal';
import CurrentCategoryBar from './components/CurrentCategoryBar';
import CategoryProductList from './components/CategoryProductList';

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

class Home extends Component {
  state = {
    viewAside: null,
  };

  componentWillMount() {
    const { homeActions } = this.props;

    homeActions.loadProductList();
  }

  handleToggleAside(asideName) {
    this.setState({
      viewAside: asideName
    });
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
        <Header
          logo={onlineStoreInfo.logo}
          title={onlineStoreInfo.storeName}
          table={tableId}
        />
        <CurrentCategoryBar
          categories={categories}
        />
        <CategoryProductList onToggle={this.handleToggleAside.bind(this)} />
        <ProductDetail
          viewProductDetail={viewAside === ASIDE_NAMES.PRODUCT_DETAIL}
          onToggle={this.handleToggleAside.bind(this)}
        />
        <MiniCartListModal
          viewCart={viewAside === ASIDE_NAMES.CART}
          onToggle={this.handleToggleAside.bind(this)}
        />
        <Menu
          viewMenu={viewAside === ASIDE_NAMES.MENU}
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
