import React, { Component } from 'react';
import qs from 'qs';
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
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../utils/gtm';
import { getErrorMessageByPromoStatus } from '../Promotion/utils';

const originHeight = document.documentElement.clientHeight || document.body.clientHeight;
const { PROMOTION_APPLIED_STATUS } = Constants;
class Cart extends Component {
  state = {
    expandBilling: true,
    isCreatingOrder: false,
    additionalComments: Utils.getSessionVariable('additionalComments'),
  };

  async componentDidMount() {
    const { homeActions } = this.props;

    await homeActions.loadShoppingCart();

    window.scrollTo(0, 0);
    this.handleResizeEvent();
  }

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
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
      search: window.location.search,
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

  handleCheckPaymentStatus = async () => {
    this.handleGtmEventTracking();
    const { history, cartSummary, user, t } = this.props;
    const { isLogin } = user;
    const { total, totalCashback } = cartSummary || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    const pathname = type ? Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO : Constants.ROUTER_PATHS.ORDERING_PAYMENT;

    if (!this.isPromotionValid()) {
      this.props.appActions.showMessageModal({
        message: t('InvalidPromoCode'),
        description: this.getPromotionErrorMessage(),
        buttonText: t('Dismiss'),
      });
      return;
    }

    if (isLogin && !total && !type) {
      const { paymentActions } = this.props;

      this.setState({
        isCreatingOrder: true,
      });

      await paymentActions.createOrder({ cashback: totalCashback });

      const { currentOrder } = this.props;
      const { orderId } = currentOrder || {};

      if (orderId) {
        Utils.removeSessionVariable('additionalComments');
      }

      const { thankYouPageUrl } = this.props;

      if (thankYouPageUrl) {
        window.location = thankYouPageUrl;
      }

      return;
    }

    history.push({
      pathname,
      search: window.location.search,
    });
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
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_PROMOTION,
      search: window.location.search,
    });
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

  renderAdditionalComments() {
    const { t } = this.props;
    const { additionalComments } = this.state;

    return (
      <div className="cart__note flex flex-middle flex-space-between">
        <textarea
          rows="4"
          placeholder={t('OrderNotesPlaceholder')}
          maxLength="140"
          value={additionalComments || ''}
          onChange={this.handleChangeAdditionalComments.bind(this)}
        ></textarea>
        {additionalComments ? (
          <IconClose className="cart__close-button" onClick={this.handleClearAdditionalComments.bind(this)} />
        ) : null}
      </div>
    );
  }

  renderPromotionItem() {
    const { t, promotion } = this.props;

    return (
      <li className="billing__item promotion__item">
        {promotion ? (
          <div className="promotion__container flex flex-middle flex-space-between">
            <span className="flex font-weight-bolder">
              <IconLocalOffer className="icon icon__privacy tag-icon text-middle" />
              <div className="promotion-info__container">
                <div className="promotion-code__container flex flex-middle text-nowrap">
                  <span className="promotion-code font-weight-bolder">
                    {t('Voucher')} ({this.showShortPromoCode()})
                  </span>
                  <button onClick={this.handleDismissPromotion} className="dismiss__button">
                    <IconClose className="icon" />
                  </button>
                </div>
                <div className="promotion__error">{this.getPromotionErrorMessage()}</div>
              </div>
            </span>
            <span className="promotion-discount__container font-weight-bolder text-nowrap">
              {'-'} <CurrencyNumber className="font-weight-bolder" money={promotion.discount} />
            </span>
          </div>
        ) : (
          <button className="add-promo__button" onClick={this.handleGotoPromotion}>
            <IconLocalOffer className="icon icon__privacy tag-icon text-middle" />
            {t('AddPromoCode')}
          </button>
        )}
      </li>
    );
  }

  render() {
    const { t, cartSummary, shoppingCart, businessInfo } = this.props;
    const { isCreatingOrder } = this.state;
    const { qrOrderingSettings } = businessInfo || {};
    const { minimumConsumption } = qrOrderingSettings || {};
    const { items } = shoppingCart || {};
    const { count, subtotal, total, tax, serviceCharge, cashback, shippingFee } = cartSummary || {};
    const isInvalidTotal =
      (Utils.isDeliveryType() && this.getDisplayPrice() < Number(minimumConsumption || 0)) || (total && total < 1);
    const minTotal = Number(minimumConsumption || 0) > 1 ? minimumConsumption : 1;

    const buttonText = !isInvalidTotal ? (
      t('Pay')
    ) : (
      <Trans i18nKey="MinimumConsumption">
        <span className="font-weight-bolder">Min</span>
        <CurrencyNumber className="font-weight-bolder" money={minTotal} />
      </Trans>
    );

    if (!(cartSummary && items)) {
      return null;
    }

    return (
      <section className={`table-ordering__order` /* hide */}>
        <Header
          className="border__bottom-divider gray flex-middle"
          isPage={true}
          title={t('ProductsInOrderText', { count: count || 0 })}
          navFunc={this.handleClickBack.bind(this)}
        >
          <button className="warning__button" onClick={this.handleClearAll.bind(this)}>
            <IconDelete />
            <span className="warning__label text-middle">{t('ClearAll')}</span>
          </button>
        </Header>
        <div className="list__container">
          <CartList isList={true} shoppingCart={shoppingCart} />
          {this.renderAdditionalComments()}
        </div>
        <aside className="aside-bottom">
          <Billing
            tax={tax}
            serviceCharge={serviceCharge}
            businessInfo={businessInfo}
            subtotal={subtotal}
            total={total}
            creditsBalance={cashback}
            isDeliveryType={Utils.isDeliveryType()}
            shippingFee={shippingFee}
          >
            {this.renderPromotionItem()}
          </Billing>
        </aside>
        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-3">
            <button
              className="billing__button button button__fill button__block dark font-weight-bolder"
              onClick={this.handleClickBack.bind(this)}
            >
              {t('Back')}
            </button>
          </div>
          <div className="footer-operation__item width-2-3">
            <button
              className="billing__link button button__fill button__block font-weight-bolder"
              onClick={this.handleCheckPaymentStatus.bind(this)}
              disabled={!items || !items.length || isCreatingOrder || isInvalidTotal}
            >
              {isCreatingOrder ? <div className="loader"></div> : isInvalidTotal ? `*` : null}
              {!isCreatingOrder ? buttonText : null}
            </button>
          </div>
        </footer>
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
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      cartActions: bindActionCreators(cartActionCreators, dispatch),
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
      promotionActions: bindActionCreators(promotionActionCreators, dispatch),
    })
  )
)(Cart);
