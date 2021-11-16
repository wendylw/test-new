import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import _floor from 'lodash/floor';
import _replace from 'lodash/replace';
import CartList from '../../components/CartList';
import { IconClose } from '../../../../../components/Icons';
import IconDeleteImage from '../../../../../images/icon-delete.svg';
import Utils from '../../../../../utils/utils.js';
import Constants from '../../../../../utils/constants';
import HybridHeader from '../../../../../components/HybridHeader';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as appActionCreators, getOnlineStoreInfo, getShoppingCart } from '../../../../redux/modules/app';
import { actions as cartActionCreators } from '../../../../redux/modules/cart';
import ProductSoldOutModal from '../../components/ProductSoldOutModal/index';
// import ShoppingCartEmpty from '../../components/ShoppingCartEmpty';
import { IconError } from '../../../../../components/Icons';

class PayLater extends Component {
  state = {
    additionalComments: Utils.getSessionVariable('additionalComments'),
    isHaveProductSoldOut: Utils.getSessionVariable('isHaveProductSoldOut'),
    cartContainerHeight: '100%',
    productsContainerHeight: '0px',
  };

  componentDidUpdate(prevProps, prevStates) {
    this.setCartContainerHeight(prevStates.cartContainerHeight);
    this.setProductsContainerHeight(prevStates.productsContainerHeight);
  }

  async componentDidMount() {
    const { appActions } = this.props;

    // TODO: Change to new load shopping cart API
    await appActions.loadShoppingCart();

    window.scrollTo(0, 0);
    this.setCartContainerHeight();
    this.setProductsContainerHeight();
  }

  setCartContainerHeight = preContainerHeight => {
    const containerHeight = Utils.containerHeight({
      headerEls: [this.headerEl],
      footerEls: [this.footerEl],
    });

    if (preContainerHeight !== containerHeight) {
      this.setState({
        cartContainerHeight: containerHeight,
      });
    }
  };

  setProductsContainerHeight = preProductsContainerHeight => {
    const productsContainerHeight = Utils.containerHeight({
      headerEls: [this.headerEl],
      footerEls: [this.footerEl],
    });
    const preHeightNumber = _floor(_replace(preProductsContainerHeight, 'px', ''));
    const currentHeightNumber = _floor(_replace(productsContainerHeight, 'px', ''));

    if (productsContainerHeight > '0px' && Math.abs(currentHeightNumber - preHeightNumber) > 10) {
      this.setState({
        productsContainerHeight,
      });
    }
  };

  handleClickContinue = async () => {};

  handleChangeAdditionalComments(e) {
    this.setState({
      additionalComments: e.target.value,
    });

    Utils.setSessionVariable('additionalComments', e.target.value);
  }

  handleClickBack = async () => {
    const newSearchParams = Utils.addParamToSearch('pageRefer', 'cart');

    if (this.additionalCommentsEl) {
      await this.additionalCommentsEl.blur();
    }

    // Fixed lazy loading issue. The first item emptied when textarea focused and back to ordering page
    const timer = setTimeout(() => {
      clearTimeout(timer);

      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
        // search: window.location.search,
        search: newSearchParams,
      });
    }, 100);
  };

  handleClearAll = () => {};

  handleClearAdditionalComments() {
    Utils.removeSessionVariable('additionalComments');
    this.setState({ additionalComments: null });
  }

  AdditionalCommentsFocus = () => {
    setTimeout(() => {
      const container = document.querySelector('.ordering-cart__container');
      const productContainer = document.querySelector('.ordering-cart__products-container');

      if (container && productContainer && Utils.getUserAgentInfo().isMobile) {
        container.scrollTop =
          productContainer.clientHeight - container.clientHeight - (document.body.clientHeight - window.innerHeight);
      }
    }, 300);
  };

  renderAdditionalComments() {
    const { t, shoppingCart } = this.props;
    const { additionalComments } = this.state;
    const { items } = shoppingCart || {};

    if (!shoppingCart || !items.length) {
      return null;
    }

    return (
      <div className="ordering-cart__additional-comments flex flex-middle flex-space-between">
        <textarea
          ref={ref => (this.additionalCommentsEl = ref)}
          className="ordering-cart__textarea form__textarea padding-small margin-left-right-small"
          rows="2"
          placeholder={t('OrderNotesPlaceholder')}
          maxLength="140"
          value={additionalComments || ''}
          data-heap-name="ordering.cart.additional-msg"
          onChange={this.handleChangeAdditionalComments.bind(this)}
          onFocus={this.AdditionalCommentsFocus}
        ></textarea>
        {additionalComments ? (
          <IconClose
            className="icon icon__big icon__default flex__shrink-fixed"
            data-heap-name="ordering.cart.clear-additional-msg"
            onClick={this.handleClearAdditionalComments.bind(this)}
          />
        ) : null}
      </div>
    );
  }

  render() {
    const { t, shoppingCart } = this.props;
    const { isHaveProductSoldOut, cartContainerHeight, productsContainerHeight } = this.state;
    const { items } = shoppingCart || {};
    const buttonText = (
      <span className="text-weight-bolder" key="pay-now">
        {t('PlaceOrder')}
      </span>
    );

    if (!items) {
      return null;
    }

    return (
      // TODO: ShoppingCartEmpty
      // <ShoppingCartEmpty t={t} history={this.props.history} />

      <section className="ordering-cart flex flex-column" data-heap-name="ordering.cart.container">
        <HybridHeader
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.cart.header"
          isPage={true}
          title={t('ProductsInOrderText', { count: 0 })}
          navFunc={() => {
            this.handleClickBack();
          }}
          rightContent={{
            icon: IconDeleteImage,
            text: t('ClearAll'),
            style: {
              color: '#fa4133',
            },
            attributes: {
              'data-heap-name': 'ordering.cart.clear-btn',
            },
            onClick: this.handleClearAll,
          }}
        ></HybridHeader>
        <div
          className="ordering-cart__container"
          style={{
            top: `${Utils.mainTop({
              headerEls: [this.headerEl],
            })}px`,
            height: cartContainerHeight,
          }}
        >
          <div className="ordering-cart__warning padding-small text-center">
            <IconError className="icon icon__primary icon__smaller" />
            <span>{t('CheckItemsBeforePlaceYourOrder')}</span>
          </div>
          <div
            className="ordering-cart__products-container"
            style={{
              minHeight: productsContainerHeight,
            }}
          >
            <CartList
              isLazyLoad={true}
              shoppingCart={shoppingCart}
              onIncreaseCartItem={(product = {}) => {}}
              onDecreaseCartItem={(product = {}) => {}}
            />
            {this.renderAdditionalComments()}
          </div>
        </div>
        <footer
          ref={ref => (this.footerEl = ref)}
          className="footer padding-small flex flex-middle flex-space-between flex__shrink-fixed"
        >
          <button
            className="ordering-cart__button-back button button__fill dark text-uppercase text-weight-bolder flex__shrink-fixed"
            onClick={() => {
              this.handleClickBack();
            }}
            data-heap-name="ordering.cart.back-btn"
          >
            {t('Back')}
          </button>
          <button
            className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
            data-testid="pay"
            data-heap-name="ordering.cart.pay-btn"
            onClick={async () => {
              await this.handleClickContinue();
            }}
            disabled={!items || !items.length}
          >
            {buttonText || t('Processing')}
          </button>
        </footer>
        <ProductSoldOutModal
          show={isHaveProductSoldOut}
          editHandler={() => {
            this.setState({
              isHaveProductSoldOut: null,
            });
            Utils.removeSessionVariable('isHaveProductSoldOut');
          }}
        />
      </section>
    );
  }
}

PayLater.displayName = 'PayLater';

/* TODO: backend data */
export default compose(
  withTranslation(['OrderingCart']),
  connect(
    state => {
      return {
        shoppingCart: getShoppingCart(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      cartActions: bindActionCreators(cartActionCreators, dispatch),
    })
  )
)(PayLater);
