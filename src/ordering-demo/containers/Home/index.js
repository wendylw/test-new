import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { actions as homeActions, getCurrentProduct, getCategoryProductList } from "../../redux/modules/home";
import { actions as cartActions } from "../../redux/modules/cart";
import Header from "../../components/Header";
import { getOnlineStoreInfo, getRequestInfo } from "../../redux/modules/app";
import CategoryProductList from "./components/CategoryProductList";
import ProductDetail from "./components/Product";
import Footer from "./components/Footer";
import MiniCartListModal from "./components/MiniCartListModal";
import Menu from "./components/Menu";
import CurrentCategoryBar from "./components/CurrentCategoryBar";

class Home extends Component {
  state = {
    viewProductDetail: false,
    viewMenu: false,
    viewCart: false,
    domLoaded: false,
  };

  componentWillMount() {
    const { homeActions } = this.props;

    homeActions.loadProductList();
  }

  componentDidMount() {
    this.setState({ domLoaded: true });
  }

  handleToggleProductDetail() {
    const { viewProductDetail } = this.state;

    this.setState({
      viewProductDetail: !viewProductDetail
    });
  }

  handleToggleCart() {
    const { viewCart } = this.state;

    this.setState({
      viewCart: !viewCart
    });
  }

  handleToggleMenu() {
    const { viewMenu } = this.state;

    this.setState({
      viewMenu: !viewMenu
    });
  }

  render() {
    const {
      categories,
      onlineStoreInfo,
      requestInfo,
    } = this.props;
    const {
      viewProductDetail,
      viewMenu,
      viewCart,
      domLoaded,
    } = this.state;
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
        <CategoryProductList />
        {
          domLoaded
            ? (
              <ProductDetail
                viewProductDetail={viewProductDetail}
                onToggle={this.handleToggleProductDetail.bind(this)}
              />
            )
            : null
        }
        {
          domLoaded
            ? (
              <MiniCartListModal
                viewCart={viewCart}
                onToggle={this.handleToggleCart.bind(this)}
              />
            )
            : null
        }
        {
          domLoaded
            ? (
              <Menu
                viewMenu={viewMenu}
                onToggle={this.handleToggleMenu.bind(this)}
              />
            )
            : null
        }
        <Footer
          tableId={tableId}
          onlineStoreInfo={onlineStoreInfo}
          onClickCart={this.handleToggleCart.bind(this)}
          onClickMenu={this.handleToggleMenu.bind(this)}
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
