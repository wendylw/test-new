import React, { Component } from 'react';
import { unwrapResult } from '@reduxjs/toolkit';
import { withTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import _floor from 'lodash/floor';
import _replace from 'lodash/replace';
import { connect } from 'react-redux';
import { compose } from 'redux';
import CartList from '../../components/CartList';
import {
  queryCartAndStatus as queryCartAndStatusThunk,
  clearQueryCartStatus as clearQueryCartStatusThunk,
  clearCart as clearCartThunk,
  submitCart as submitCartThunk,
  updateCartItems as updateCartItemsThunk,
  removeCartItemsById as removeCartItemsByIdThunk,
  loadCartStatus as loadCartStatusThunk,
} from '../../../../redux/cart/thunks';
import {
  getCartItems,
  getCartUnavailableItems,
  getCartItemsCount,
  getCartSubmittedStatus,
  getCartNotSubmittedAndEmpty,
  getCartSubmissionRequestingStatus,
  getCartReceiptNumber,
} from '../../../../redux/cart/selectors';
import { IconClose, IconError } from '../../../../../components/Icons';
import IconDeleteImage from '../../../../../images/icon-delete.svg';
import Utils from '../../../../../utils/utils';
import Constants from '../../../../../utils/constants';
import HybridHeader from '../../../../../components/HybridHeader';
import CartEmptyResult from '../../components/CartEmptyResult';

import logger from '../../../../../utils/monitoring/logger';
import { alert } from '../../../../../common/feedback';

class PayLater extends Component {
  constructor(props) {
    super(props);
    this.state = {
      additionalComments: Utils.getSessionVariable('additionalComments'),
      cartContainerHeight: '100%',
      productsContainerHeight: '0px',
    };
  }

  componentDidMount = async () => {
    const { queryCartAndStatus } = this.props;

    await queryCartAndStatus();

    window.scrollTo(0, 0);
    this.setCartContainerHeight();
    this.setProductsContainerHeight();
  };

  componentDidUpdate(prevProps, prevStates) {
    this.setCartContainerHeight(prevStates.cartContainerHeight);
    this.setProductsContainerHeight(prevStates.productsContainerHeight);
  }

  componentWillUnmount = async () => {
    const { clearQueryCartStatus } = this.props;

    await clearQueryCartStatus();
  };

  handleClickContinue = async () => {
    try {
      const { history, submitCart } = this.props;
      const { additionalComments } = this.state;
      const { submissionId } = await submitCart(additionalComments).then(unwrapResult);

      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_CART_SUBMISSION_STATUS,
        search: `${Utils.getFilteredQueryString(['submissionId'])}&submissionId=${submissionId}`,
      });
    } catch (e) {
      if (e.code === '393735') {
        const { t, receiptNumber, loadCartStatus } = this.props;

        alert(
          <Trans
            t={t}
            ns="ApiError"
            i18nKey="HasBeenPlacedContentDescription"
            components={{ bold: <strong className="text-size-big" /> }}
          />,
          {
            className: 'ordering-cart__alert',
            title: t('ApiError:UnableToPlaceOrder'),
            closeButtonContent: t('ApiError:ViewOrder'),
            onClose: async () => {
              if (!receiptNumber) {
                await loadCartStatus();
              }

              this.goToTableSummaryPage();
            },
          }
        );
      } else if (e.code === '393476') {
        const { t, history } = this.props;

        alert(t('OrderHasBeenAddedOrRemoved'), {
          title: t('RefreshCartToContinue'),
          closeButtonContent: t('RefreshCart'),
          onClose: () =>
            history.push({
              pathname: Constants.ROUTER_PATHS.ORDERING_CART,
              search: window.location.search,
            }),
        });
      }
    }
  };

  handleChangeAdditionalComments = e => {
    this.setState({
      additionalComments: e.target.value,
    });

    Utils.setSessionVariable('additionalComments', e.target.value);
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

  handleClickBack = async () => {
    if (this.additionalCommentsEl) {
      await this.additionalCommentsEl.blur();
    }

    // Fixed lazy loading issue. The first item emptied when textarea focused and back to ordering page
    const timer = setTimeout(() => {
      clearTimeout(timer);
      const { history } = this.props;

      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
        search: window.location.search,
      });
    }, 100);
  };

  handleClearAll = () => {
    const { clearCart, history } = this.props;

    clearCart().then(() => {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
        search: window.location.search,
      });
    });
  };

  handleClearAdditionalComments = () => {
    Utils.removeSessionVariable('additionalComments');
    this.setState({ additionalComments: null });
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
          isLazyLoad
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

  getUpdateShoppingCartItemData = ({ productId, comments, variations }, quantityChange) => ({
    productId,
    quantityChange,
    comments,
    variations: (variations || []).map(({ variationId, optionId, quantity }) => ({
      variationId,
      optionId,
      quantity,
    })),
  });

  goToTableSummaryPage = () => {
    const { history, receiptNumber } = this.props;

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_TABLE_SUMMARY,
      search: `${Utils.getFilteredQueryString(['receiptNumber', 'submissionId'])}&receiptNumber=${receiptNumber}`,
    });
  };

  handleDecreaseCartItem = cartItem => {
    const { updateCartItems } = this.props;
    logger.log('Ordering_PayLaterCart_DecreaseItem');
    const { quantity } = cartItem;

    if (quantity <= 1) {
      this.handleRemoveCartItem(cartItem);
    }

    updateCartItems(this.getUpdateShoppingCartItemData(cartItem, -1));
  };

  handleIncreaseCartItem = cartItem => {
    const { updateCartItems } = this.props;
    logger.log('Ordering_PayLaterCart_IncreaseItem');

    updateCartItems(this.getUpdateShoppingCartItemData(cartItem, 1));
  };

  handleRemoveCartItem = cartItem => {
    logger.log('Ordering_PayLaterCart_RemoveItem');
    const { id } = cartItem;
    const { removeCartItemsById } = this.props;
    removeCartItemsById(id);
  };

  handleReturnToMenu = () => {
    const { history } = this.props;
    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
      search: window.location.search,
    });
  };

  handleReturnToTableSummary = () => {
    this.goToTableSummaryPage();
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
          ref={ref => {
            this.additionalCommentsEl = ref;
          }}
          className="ordering-cart__textarea form__textarea padding-small margin-left-right-small"
          rows="2"
          placeholder={t('OrderNotesPlaceholder')}
          maxLength="140"
          value={additionalComments || ''}
          data-heap-name="ordering.cart.additional-msg"
          onChange={this.handleChangeAdditionalComments}
          onFocus={this.AdditionalCommentsFocus}
        />
        {additionalComments ? (
          <IconClose
            className="icon icon__big icon__default flex__shrink-fixed"
            data-heap-name="ordering.cart.clear-additional-msg"
            onClick={this.handleClearAdditionalComments}
          />
        ) : null}
      </div>
    );
  }

  render() {
    const {
      t,
      history,
      count,
      cartItems,
      unavailableCartItems,
      cartSubmittedStatus,
      cartNotSubmittedAndEmpty,
      cartSubmissionRequesting,
    } = this.props;
    const { cartContainerHeight } = this.state;

    const buttonText = (
      <span className="text-weight-bolder" key="place-order">
        {cartSubmissionRequesting ? t('Processing') : t('PlaceOrder')}
      </span>
    );

    return (
      <section className="ordering-cart flex flex-column" data-heap-name="ordering.cart.container">
        <HybridHeader
          headerRef={ref => {
            this.headerEl = ref;
          }}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.cart.header"
          isPage
          title={t('ProductsInOrderText', { count })}
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
        />
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
          ref={ref => {
            this.footerEl = ref;
          }}
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
            disabled={!cartItems.length || !!unavailableCartItems.length || cartSubmissionRequesting}
          >
            {buttonText}
          </button>
        </footer>
        {cartNotSubmittedAndEmpty ? (
          <CartEmptyResult
            history={history}
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

PayLater.propTypes = {
  queryCartAndStatus: PropTypes.func,
  loadCartStatus: PropTypes.func,
  receiptNumber: PropTypes.string,
  cartSubmittedStatus: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  cartItems: PropTypes.array,
  clearQueryCartStatus: PropTypes.func,
  submitCart: PropTypes.func,
  clearCart: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  unavailableCartItems: PropTypes.array,
  updateCartItems: PropTypes.func,
  removeCartItemsById: PropTypes.func,
  count: PropTypes.number,
  cartNotSubmittedAndEmpty: PropTypes.bool,
  cartSubmissionRequesting: PropTypes.bool,
};

PayLater.defaultProps = {
  cartItems: [],
  unavailableCartItems: [],
  count: 0,
  cartSubmittedStatus: false,
  cartNotSubmittedAndEmpty: false,
  cartSubmissionRequesting: false,
  receiptNumber: null,
  queryCartAndStatus: () => {},
  loadCartStatus: () => {},
  clearQueryCartStatus: () => {},
  submitCart: () => {},
  clearCart: () => {},
  updateCartItems: () => {},
  removeCartItemsById: () => {},
};

export default compose(
  withTranslation(['OrderingCart']),
  connect(
    state => ({
      cartItems: getCartItems(state),
      unavailableCartItems: getCartUnavailableItems(state),
      count: getCartItemsCount(state),
      cartSubmittedStatus: getCartSubmittedStatus(state),
      cartNotSubmittedAndEmpty: getCartNotSubmittedAndEmpty(state),
      cartSubmissionRequesting: getCartSubmissionRequestingStatus(state),
      receiptNumber: getCartReceiptNumber(state),
    }),
    {
      removeCartItemsById: removeCartItemsByIdThunk,
      updateCartItems: updateCartItemsThunk,
      submitCart: submitCartThunk,
      clearCart: clearCartThunk,
      clearQueryCartStatus: clearQueryCartStatusThunk,
      queryCartAndStatus: queryCartAndStatusThunk,
      loadCartStatus: loadCartStatusThunk,
    }
  )
)(PayLater);
