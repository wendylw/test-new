import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import Billing from '../../components/Billing';
import CartList from './components/CartList';
import { IconDelete, IconClose, IconLocalOffer } from '../../../components/Icons';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';
import Header from '../../../components/Header';
import CurrencyNumber from '../../components/CurrencyNumber';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { getCartSummary, getPromotion } from '../../../redux/modules/entities/carts';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';
import { actions as cartActionCreators, getBusinessInfo } from '../../redux/modules/cart';
import { actions as promotionActionCreators } from '../../redux/modules/promotion';
import { actions as homeActionCreators, getShoppingCart, getCurrentProduct } from '../../redux/modules/home';
import { actions as appActionCreators, getOnlineStoreInfo, getUser, getBusiness } from '../../redux/modules/app';
import { actions as paymentActionCreators, getThankYouPageUrl, getCurrentOrderId } from '../../redux/modules/payment';
import { actions as customerActionCreators, getDeliveryDetails } from '../../redux/modules/customer';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../utils/gtm';
import { getErrorMessageByPromoStatus } from '../Promotion/utils';
import ProductSoldOutModal from './components/ProductSoldOutModal/index';
import './OrderingCart.scss';
import Url from '../../../utils/url';
import { get } from '../../../utils/request';

const originHeight = document.documentElement.clientHeight || document.body.clientHeight;
const { PROMOTION_APPLIED_STATUS } = Constants;
class Cart extends Component {
  state = {
    expandBilling: true,
    isCreatingOrder: false,
    additionalComments: Utils.getSessionVariable('additionalComments'),
    isHaveProductSoldOut: Utils.getSessionVariable('isHaveProductSoldOut'),
    cartContainerHeight: '100%',
  };

  componentDidUpdate(prevProps, prevStates) {
    this.setCartContainerHeight(prevStates.cartContainerHeight);
  }

  async componentDidMount() {
    const { homeActions } = this.props;

    await homeActions.loadShoppingCart();

    window.scrollTo(0, 0);
    this.handleResizeEvent();
    this.setCartContainerHeight();
  }

  componentWillUnmount() {
    this.setState({ isCreatingOrder: false });
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

  handleClickContinue = async () => {
    const { user, history, customerActions, deliveryDetails } = this.props;
    const { username, phone: orderPhone } = deliveryDetails || {};
    const { consumerId, isLogin, profile } = user || {};
    const { name, phone } = profile || {};

    if (!isLogin) {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
        search: window.location.search,
        nextPage: true,
      });
    }

    // if have name, redirect to customer page
    // if have consumerId, get profile first and update consumer profile, then redirect to next page
    if (isLogin && name) {
      !username && (await customerActions.patchDeliveryDetails({ username: name }));
      !orderPhone && (await customerActions.patchDeliveryDetails({ phone: phone }));
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
        search: window.location.search,
      });
    } else {
      if (isLogin && consumerId) {
        let request = Url.API_URLS.GET_CONSUMER_PROFILE(consumerId);
        let { firstName, email, birthday, phone } = await get(request.url);
        this.props.appActions.updateProfileInfo({
          name: firstName,
          email,
          birthday,
          phone,
        });
        !username && (await customerActions.patchDeliveryDetails({ username: firstName }));
        !orderPhone && (await customerActions.patchDeliveryDetails({ phone: phone }));
        firstName
          ? history.push({
              pathname: Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
              search: window.location.search,
            })
          : history.push({
              pathname: Constants.ROUTER_PATHS.PROFILE,
              search: window.location.search,
            });
      }
    }
  };

  handleResizeEvent() {
    window.addEventListener(
      'resize',
      () => {
        const resizeHeight = document.documentElement.clientHeight || document.body.clientHeight;
        if (resizeHeight < originHeight) {
          this.setState({
            expandBilling: false,
          });
        } else {
          this.setState({
            expandBilling: true,
          });
        }
      },
      false
    );
  }

  getDisplayPrice() {
    const { shoppingCart } = this.props;
    const { items } = shoppingCart || {};
    let totalPrice = 0;

    (items || []).forEach(item => {
      totalPrice += item.displayPrice * item.quantity;
    });

    return totalPrice;
  }

  handleChangeAdditionalComments(e) {
    this.setState({
      additionalComments: e.target.value,
    });

    Utils.setSessionVariable('additionalComments', e.target.value);
  }

  handleClickBack = () => {
    const newSearchParams = Utils.addParamToSearch('pageRefer', 'cart');
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
      // search: window.location.search,
      search: newSearchParams,
    });
  };

  isPromotionValid() {
    const { promotion } = this.props;
    if (!promotion) {
      return true;
    }

    return promotion.status === PROMOTION_APPLIED_STATUS.VALID;
  }

  handleGtmEventTracking = async callback => {
    const { shoppingCart, cartSummary } = this.props;
    const itemsInCart = shoppingCart.items.map(item => item.id);
    const gtmEventData = {
      product_id: itemsInCart,
      cart_size: cartSummary.count,
      cart_value_local: cartSummary.total,
    };
    gtmEventTracking(GTM_TRACKING_EVENTS.INITIATE_CHECKOUT, gtmEventData, callback);
  };

  handleClearAll = () => {
    this.props.cartActions.clearAll().then(() => {
      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
        search: window.location.search,
      });
    });
  };

  handleClearAdditionalComments() {
    Utils.removeSessionVariable('additionalComments');
    this.setState({ additionalComments: null });
  }

  getPromotionErrorMessage = () => {
    const { promotion } = this.props;
    if (!promotion) {
      return '';
    }

    return getErrorMessageByPromoStatus(promotion);
  };

  handleDismissPromotion = e => {
    this.dismissPromotion();
  };

  dismissPromotion = async () => {
    const { promotionActions, homeActions } = this.props;

    await promotionActions.dismissPromotion();
    await homeActions.loadShoppingCart();
  };

  handleGotoPromotion = () => {
    const { user } = this.props;
    const { isLogin } = user || {};

    if (isLogin) {
      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_PROMOTION,
        search: window.location.search,
      });
    } else {
      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
        search: window.location.search,
      });
    }
  };

  showShortPromoCode() {
    const { promotion } = this.props;
    const SHOW_LENGTH = 10;
    // show like "Promo..."
    if (promotion && promotion.promoCode) {
      if (promotion.promoCode.length > SHOW_LENGTH) {
        return promotion.promoCode.substring(0, SHOW_LENGTH) + '...';
      } else {
        return promotion.promoCode;
      }
    } else {
      return '';
    }
  }

  AdditionalCommentsFocus = () => {
    setTimeout(() => {
      const container = document.querySelector('.ordering-cart__container');

      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 300);
  };

  renderAdditionalComments() {
    const { t } = this.props;
    const { additionalComments } = this.state;

    return (
      <div className="ordering-cart__additional-comments flex flex-middle flex-space-between">
        <textarea
          className="ordering-cart__textarea form__textarea padding-small margin-left-right-small"
          rows="2"
          placeholder={t('OrderNotesPlaceholder')}
          maxLength="140"
          value={additionalComments || ''}
          data-heap-name="ordering.cart.additional-msg"
          onChange={this.handleChangeAdditionalComments.bind(this)}
          onFocus={this.AdditionalCommentsFocus}
          onBlur={this.setCartContainerHeight}
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

  renderPromotionItem() {
    const { t, promotion } = this.props;

    return (
      <li className="flex flex-middle flex-space-between border__top-divider border__bottom-divider">
        {promotion ? (
          <React.Fragment>
            <span className="flex flex-middle flex-space-between padding-left-right-small text-weight-bolder">
              <IconLocalOffer className="icon icon__small icon__primary text-middle" />
              <div>
                <div className="flex flex-middle text-omit__single-line">
                  <span className="margin-left-right-small text-size-big text-weight-bolder">
                    {t(promotion.promoType)} ({this.showShortPromoCode()})
                  </span>
                  <button
                    onClick={this.handleDismissPromotion}
                    className="button"
                    data-heap-name="ordering.cart.dismiss-promo"
                  >
                    <IconClose className="icon icon__small" />
                  </button>
                </div>
                {Boolean(this.getPromotionErrorMessage()) ? (
                  <p className="form__error-message margin-left-right-small text-omit__single-line text-weight-bolder">
                    {this.getPromotionErrorMessage()}
                  </p>
                ) : null}
              </div>
            </span>
            <div className="padding-top-bottom-small padding-left-right-normal text-weight-bolder flex__shrink-fixed">
              {'-'} <CurrencyNumber className="text-size-big text-weight-bolder" money={promotion.discount} />
            </div>
          </React.Fragment>
        ) : (
          <button
            className="cart-promotion__button-acquisition button button__block text-left padding-top-bottom-smaller padding-left-right-normal"
            onClick={this.handleGotoPromotion}
            data-heap-name="ordering.cart.add-promo"
          >
            <IconLocalOffer className="icon icon__small icon__primary text-middle" />
            <span className="margin-left-right-small text-size-big text-middle">{t('AddPromoCode')}</span>
          </button>
        )}
      </li>
    );
  }

  checkCartItemSoldOut = (shoppingCart = {}) => {
    const { unavailableItems = [], items = [] } = shoppingCart;
    const cartList = [...unavailableItems, ...items];

    for (let i = 0; i < cartList.length; i++) {
      const cartItem = cartList[i];
      const { markedSoldOut, variations } = cartItem;

      if (markedSoldOut) {
        return true;
      }

      if (Array.isArray(variations) && variations.length > 0) {
        if (variations.find(variation => variation.markedSoldOut)) {
          return true;
        }
      }
    }
    return false;
  };

  render() {
    const { t, cartSummary, shoppingCart, businessInfo, user, history } = this.props;
    const { isCreatingOrder, isHaveProductSoldOut, cartContainerHeight } = this.state;
    const { qrOrderingSettings } = businessInfo || {};
    const { minimumConsumption } = qrOrderingSettings || {};
    const { items } = shoppingCart || {};
    const { count, subtotal, total, tax, serviceCharge, cashback, shippingFee } = cartSummary || {};
    const { isLogin } = user || {};
    const isInvalidTotal =
      (Utils.isDeliveryType() && this.getDisplayPrice() < Number(minimumConsumption || 0)) || (total > 0 && total < 1);
    const minTotal = Utils.isDeliveryType() && Number(minimumConsumption || 0) > 1 ? minimumConsumption : 1;
    // const haveItemSoldOut = this.checkCartItemSoldOut(shoppingCart);
    const buttonText = !isInvalidTotal ? (
      t('PayNow')
    ) : (
      <Trans i18nKey="MinimumConsumption">
        <span className="text-weight-bolder">Min</span>
        <CurrencyNumber className="text-weight-bolder" money={minTotal} />
      </Trans>
    );

    if (!(cartSummary && items)) {
      return null;
    }

    return (
      <section className="ordering-cart flex flex-column" data-heap-name="ordering.cart.container">
        <Header
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.cart.header"
          isPage={true}
          title={t('ProductsInOrderText', { count: count || 0 })}
          navFunc={this.handleClickBack.bind(this)}
        >
          <button
            className="button flex__shrink-fixed padding-top-bottom-smaller padding-left-right-normal"
            onClick={this.handleClearAll.bind(this)}
            data-heap-name="ordering.cart.clear-btn"
          >
            <IconDelete className="icon icon__normal icon__error text-middle" />
            <span className="text-middle text-size-big text-error">{t('ClearAll')}</span>
          </button>
        </Header>
        <div
          className="ordering-cart__container"
          style={{
            top: `${Utils.mainTop({
              headerEls: [this.headerEl],
            })}px`,
            height: cartContainerHeight,
          }}
        >
          <CartList isLazyLoad={true} shoppingCart={shoppingCart} />
          {this.renderAdditionalComments()}
          <Billing
            tax={tax}
            serviceCharge={serviceCharge}
            businessInfo={businessInfo}
            subtotal={subtotal}
            total={total}
            creditsBalance={cashback}
            isDeliveryType={Utils.isDeliveryType()}
            shippingFee={shippingFee}
            isLogin={isLogin}
            history={history}
          >
            {this.renderPromotionItem()}
          </Billing>
        </div>
        <footer
          ref={ref => (this.footerEl = ref)}
          className="footer padding-small flex flex-middle flex-space-between flex__shrink-fixed"
        >
          <button
            className="ordering-cart__button-back button button__fill dark text-uppercase text-weight-bolder flex__shrink-fixed"
            onClick={this.handleClickBack.bind(this)}
            data-heap-name="ordering.cart.back-btn"
          >
            {t('Back')}
          </button>
          <button
            className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
            data-testid="pay"
            data-heap-name="ordering.cart.pay-btn"
            onClick={() => {
              if (!this.isPromotionValid()) {
                this.props.appActions.showMessageModal({
                  message: t('InvalidPromoCode'),
                  description: this.getPromotionErrorMessage(),
                  buttonText: t('Dismiss'),
                });

                return;
              }

              this.setState({ isCreatingOrder: true });

              this.handleGtmEventTracking(async () => {
                await this.handleClickContinue();
              });
            }}
            disabled={!items || !items.length || isInvalidTotal}
          >
            {isCreatingOrder ? t('Processing') : isInvalidTotal && `*`}
            {!isCreatingOrder && buttonText}
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
/* TODO: backend data */
export default compose(
  withTranslation(['OrderingCart', 'OrderingPromotion']),
  connect(
    state => {
      const currentOrderId = getCurrentOrderId(state);

      return {
        business: getBusiness(state),
        user: getUser(state),
        cartSummary: getCartSummary(state),
        promotion: getPromotion(state),
        shoppingCart: getShoppingCart(state),
        businessInfo: getBusinessInfo(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        currentProduct: getCurrentProduct(state),
        thankYouPageUrl: getThankYouPageUrl(state),
        currentOrder: getOrderByOrderId(state, currentOrderId),
        allBusinessInfo: getAllBusinesses(state),
        deliveryDetails: getDeliveryDetails(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      cartActions: bindActionCreators(cartActionCreators, dispatch),
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
      promotionActions: bindActionCreators(promotionActionCreators, dispatch),
      customerActions: bindActionCreators(customerActionCreators, dispatch),
    })
  )
)(Cart);
