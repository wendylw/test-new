import React, { Component } from 'react';
import { unwrapResult } from '@reduxjs/toolkit';
import { withTranslation } from 'react-i18next';
import _floor from 'lodash/floor';
import _replace from 'lodash/replace';
import CartList from '../../components/CartList';
import {
  queryCartAndStatus,
  clearQueryCartStatus,
  clearCart,
  submitCart,
  updateCartItems,
  removeCartItemsById,
} from '../../../../redux/cart/thunks';
import {
  getCartItems,
  getCartUnavailableItems,
  getCartItemsCount,
  getCartSubmittedStatus,
  getCartNotSubmittedAndEmpty,
  getCartSubmissionRequestingStatus,
} from '../../../../redux/cart/selectors';
import { IconClose } from '../../../../../components/Icons';
import IconDeleteImage from '../../../../../images/icon-delete.svg';
import Utils from '../../../../../utils/utils.js';
import Constants from '../../../../../utils/constants';
import HybridHeader from '../../../../../components/HybridHeader';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import CartEmptyResult from '../../components/CartEmptyResult';
import { IconError } from '../../../../../components/Icons';
import loggly from '../../../../../utils/monitoring/loggly';
import { alert } from '../../../../../common/feedback';

class PayLater extends Component {
  state = {
    additionalComments: Utils.getSessionVariable('additionalComments'),
    cartContainerHeight: '100%',
    productsContainerHeight: '0px',
  };

  componentDidMount = async () => {
    const { t, queryCartAndStatus } = this.props;

    await queryCartAndStatus();

    window.scrollTo(0, 0);
    this.setCartContainerHeight();
    this.setProductsContainerHeight();
  };

  componentDidUpdate(prevProps, prevStates) {
    this.setCartContainerHeight(prevStates.cartContainerHeight);
    this.setProductsContainerHeight(prevStates.productsContainerHeight);

    const { receiptNumber, cartSubmittedStatus, cartItems, t } = this.props;
    const { cartSubmittedStatus: prevCartSubmittedStatus } = prevProps;

    if (cartSubmittedStatus && cartSubmittedStatus !== prevCartSubmittedStatus && !cartItems.length) {
      alert(t('ApiError:HasBeenPlacedContentDescription'), {
        title: t('ApiError:UnableToPlaceOrder'),
        closeButtonContent: t('ApiError:ViewOrder'),
        onClose: () =>
          this.props.history.push({
            pathname: Constants.ROUTER_PATHS.ORDERING_TABLE_SUMMARY,
            search: `${window.location.search}&receiptNumber=${receiptNumber}`,
          }),
      });
    }
  }

  componentWillUnmount = () => {
    const { clearQueryCartStatus } = this.props;
    clearQueryCartStatus();
  };

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

  handleClickContinue = async () => {
    try {
      const { history, submitCart } = this.props;
      const { additionalComments } = this.state;
      // TODO: Move unwrapResult to redux
      const result = await submitCart(additionalComments).then(unwrapResult);
      const { submissionId } = result;
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_CART_SUBMISSION_STATUS,
        search: `${window.location.search}&submissionId=${submissionId}`,
      });
    } catch (e) {
      if (e.code === 'place ordered') {
        const { t, history, receiptNumber } = this.props;
        alert(t('ApiError:HasBeenPlacedContentDescription'), {
          title: t('ApiError:UnableToPlaceOrder'),
          closeButtonContent: t('ApiError:ViewOrder'),
          onClose: () =>
            history.push({
              pathname: Constants.ROUTER_PATHS.ORDERING_TABLE_SUMMARY,
              search: `${window.location.search}&receiptNumber=${receiptNumber}`,
            }),
        });
      } else if (e.code === 'other error refresh cart') {
        const { t, history, receiptNumber } = this.props;
        alert(t('OrderHasBeenAddedOrRemoved'), {
          title: t('RefreshCartToContinue'),
          closeButtonContent: t('RefreshCart'),
          onClose: () =>
            history.push({
              pathname: Constants.ROUTER_PATHS.ORDERING_CART,
              search: `${window.location.search}&receiptNumber=${receiptNumber}`,
            }),
        });
      }
    }
  };

  handleChangeAdditionalComments(e) {
    this.setState({
      additionalComments: e.target.value,
    });

    Utils.setSessionVariable('additionalComments', e.target.value);
  }

  handleClickBack = async () => {
    if (this.additionalCommentsEl) {
      await this.additionalCommentsEl.blur();
    }

    // Fixed lazy loading issue. The first item emptied when textarea focused and back to ordering page
    const timer = setTimeout(() => {
      clearTimeout(timer);

      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
        search: window.location.search,
      });
    }, 100);
  };

  handleClearAll = () => {
    this.props.clearCart().then(() => {
      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
        search: window.location.search,
      });
    });
  };

  renderCartList = () => {
    const { cartItems, unavailableCartItems } = this.props;
    const { productsContainerHeight } = this.state;
    return (
      <div
        className="ordering-cart__products-container"
        style={{
          minHeight: productsContainerHeight,
        }}
      >
        <CartList
          isLazyLoad={true}
          items={cartItems}
          unavailableItems={unavailableCartItems}
          onIncreaseCartItem={this.handleIncreaseCartItem}
          onDecreaseCartItem={this.handleDecreaseCartItem}
          onRemoveCartItem={this.handleRemoveCartItem}
        />
        {this.renderAdditionalComments()}
      </div>
    );
  };

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

  getUpdateShoppingCartItemData = ({ productId, variations }, quantityChange) => {
    return {
      productId,
      quantityChange,
      variations: (variations || []).map(({ variationId, optionId }) => ({
        variationId,
        optionId,
      })),
    };
  };

  handleIncreaseCartItem = cartItem => {
    loggly.log('pay-later-cart.item-operate-attempt');

    this.props.updateCartItems(this.getUpdateShoppingCartItemData(cartItem, 1));
  };

  handleDecreaseCartItem = cartItem => {
    loggly.log('pay-later-cart.item-operate-attempt');
    const { quantity } = cartItem;

    if (quantity <= 1) {
      return this.handleRemoveCartItem(cartItem);
    }

    this.props.updateCartItems(this.getUpdateShoppingCartItemData(cartItem, -1));
  };

  handleRemoveCartItem = cartItem => {
    loggly.log('pay-later-cart.item-operate-attempt');
    const { id } = cartItem;
    this.props.removeCartItemsById(id);
  };

  renderAdditionalComments() {
    const { t, cartItems } = this.props;
    const { additionalComments } = this.state;

    if (!cartItems.length) {
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

  handleReturnToMenu = () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
      search: window.location.search,
    });
  };

  handleReturnToTableSummary = () => {
    const { history, receiptNumber } = this.props;

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_TABLE_SUMMARY,
      search: `${window.location.search}&receiptNumber=${receiptNumber}`,
    });
  };

  render() {
    const { t, count, cartItems, cartSubmittedStatus, cartNotSubmittedAndEmpty, cartSubmissionRequesting } = this.props;
    const { cartContainerHeight } = this.state;

    const buttonText = (
      <span className="text-weight-bolder" key="place-order">
        {cartSubmissionRequesting ? t('Processing') : t('PlaceOrder')}
      </span>
    );

    return (
      <section className="ordering-cart flex flex-column" data-heap-name="ordering.cart.container">
        <HybridHeader
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.cart.header"
          isPage={true}
          title={t('ProductsInOrderText', { count: count })}
          navFunc={() => {
            this.handleClickBack();
          }}
          rightContent={
            cartNotSubmittedAndEmpty
              ? null
              : {
                  icon: IconDeleteImage,
                  text: t('ClearAll'),
                  style: {
                    color: '#fa4133',
                  },
                  attributes: {
                    'data-heap-name': 'ordering.cart.clear-btn',
                  },
                  onClick: this.handleClearAll,
                }
          }
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
          <div className="ordering-cart__warning padding-small flex flex-middle flex-center">
            <IconError className="icon icon__primary icon__smaller" />
            <span>{t('CheckItemsBeforePlaceYourOrder')}</span>
          </div>
          {this.renderCartList()}
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
            disabled={!cartItems.length || cartSubmissionRequesting}
          >
            {buttonText}
          </button>
        </footer>
        {cartNotSubmittedAndEmpty ? (
          <CartEmptyResult
            history={this.props.history}
            submittedStatus={cartSubmittedStatus}
            handleReturnToMenu={this.handleReturnToMenu}
            handleReturnToTableSummary={this.handleReturnToTableSummary}
          />
        ) : null}
      </section>
    );
  }
}

PayLater.displayName = 'PayLater';

export default compose(
  withTranslation(['OrderingCart']),
  connect(
    state => {
      return {
        cartItems: getCartItems(state),
        unavailableCartItems: getCartUnavailableItems(state),
        count: getCartItemsCount(state),
        cartSubmittedStatus: getCartSubmittedStatus(state),
        cartNotSubmittedAndEmpty: getCartNotSubmittedAndEmpty(state),
        cartSubmissionRequesting: getCartSubmissionRequestingStatus(state),
      };
    },
    dispatch => ({
      removeCartItemsById: bindActionCreators(removeCartItemsById, dispatch),
      updateCartItems: bindActionCreators(updateCartItems, dispatch),
      submitCart: bindActionCreators(submitCart, dispatch),
      clearCart: bindActionCreators(clearCart, dispatch),
      clearQueryCartStatus: bindActionCreators(clearQueryCartStatus, dispatch),
      queryCartAndStatus: bindActionCreators(queryCartAndStatus, dispatch),
    })
  )
)(PayLater);
