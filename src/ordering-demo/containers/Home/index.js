import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { actions as homeActions, getShoppingCart, getCategoryProductList, getCurrentProduct, getViewCart, getViewMenu } from "../../redux/modules/home";
import { actions as cartActions } from "../../redux/modules/cart";
import Header from "../../components/Header";
import { getOnlineStoreInfo, getRequestInfo } from "../../redux/modules/app";
import CategoryProductList from "./components/CategoryProductList";
import ProductDetailModal from "./components/ProductDetailModal";
import Footer from "./components/Footer";
import MiniCartListModal from "./components/MiniCartListModal";
import { getProductById } from "../../../redux/modules/entities/products";
import MenuModal from "./components/MenuModal";
import CurrentCategoryBar from "./components/CurrentCategoryBar";

class Home extends Component {
  componentDidMount() {
    const { homeActions } = this.props;
    homeActions.loadProductList();
  }

  render() {
    console.log('_Home.render()');
    const {
      categories,
      onlineStoreInfo,
      shoppingCart,
      requestInfo,
      currentProduct,
      showCart,
      showMenu,
      homeActions,
    } = this.props;

    if (!onlineStoreInfo || !categories) {
      return null;
    }

    return (
      <section className="table-ordering__home">
        <Header
          logo={onlineStoreInfo.logo}
          title={onlineStoreInfo.storeName}
          table={requestInfo.tableId}
        />
        <CurrentCategoryBar
          categories={categories}
        />
        <CategoryProductList
          categories={categories}
          onDecreaseItem={this.handleDecreaseProductInCart}
          onIncreaseItem={this.handleIncreaseProductInCart}
        />
        {
          (currentProduct && currentProduct.id && !currentProduct._needMore)
            ? (
              <ProductDetailModal
                product={currentProduct}
                addOrUpdateShoppingCartItem={async (variables) => {
                  await homeActions.addOrUpdateShoppingCartItem(variables);
                  this.handleHideProductDetailModal();
                  await homeActions.loadShoppingCart();
                }}
                onHide={this.handleHideProductDetailModal}
              />
            )
            : null
        }
        {
          showCart
            ? (
              <MiniCartListModal
                shoppingCart={shoppingCart}
                onHide={this.handleHideMiniCartListModal}
                onClearAll={this.handleClearAll}
              />
            )
            : null
        }
        {
          showMenu
            ? (
              <MenuModal
                categories={categories}
                onHide={this.handleHideMenuModal}
              />
            )
            : null
        }
        <Footer
          categories={categories}
          tableId={requestInfo.tableId}
          cartSummary={shoppingCart.summary}
          onClickCart={this.handleShowMiniCartModal}
          onClickMenu={this.handleShopMenuModal}
        />
      </section>
    );
  }

  handleDecreaseProductInCart = async (product) => {
    try {
      await this.props.homeActions.decreaseProductInCart(product);
      await this.props.homeActions.loadShoppingCart();
    } catch (e) {
      console.error(e);
    }
  }

  handleIncreaseProductInCart = async (product) => {
    try {
      await this.props.homeActions.increaseProductInCart(product);
      await this.props.homeActions.loadShoppingCart();
    } catch (e) {
      console.error(e);
    }
  }

  handleHideProductDetailModal = () => {
    this.props.homeActions.closeProduct();
  }

  handleShopMenuModal = () => {
    this.props.homeActions.viewMenu();
  }

  handleHideMenuModal = () => {
    this.props.homeActions.closeMenu();
  }

  handleHideMiniCartListModal = () => {
    this.props.homeActions.closeCart();
  }

  handleShowMiniCartModal = () => {
    this.props.homeActions.viewCart();
  }

  handleClearAll = async () => {
    await this.props.cartActions.clearAll();
    await this.props.homeActions.closeCart();
  }
}

export default connect(
  state => {
    const currentProductInfo = getCurrentProduct(state);
    return {
      showCart: getViewCart(state),
      showMenu: getViewMenu(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      shoppingCart: getShoppingCart(state),
      categories: getCategoryProductList(state),
      requestInfo: getRequestInfo(state),
      currentProduct: currentProductInfo && getProductById(state, currentProductInfo.id),
    };
  },
  dispatch => ({
    homeActions: bindActionCreators(homeActions, dispatch),
    cartActions: bindActionCreators(cartActions, dispatch),
  }),
)(Home);
