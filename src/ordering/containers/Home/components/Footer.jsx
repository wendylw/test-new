import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation, Trans } from 'react-i18next';
import Constants from '../../../../utils/constants';
import {
  actions as appActionCreators,
  getUser,
  getShoppingCart,
  getCartBilling,
  getBusinessInfo,
  getDeliveryInfo,
  getCategoryProductList,
  getUserIsLogin,
  getIsUserLoginRequestStatusInPending,
} from '../../../redux/modules/app';
import { getCartItemsCount } from '../../../redux/cart/selectors';
import Utils from '../../../../utils/utils';
import { IconCart } from '../../../../components/Icons';
import CurrencyNumber from '../../../components/CurrencyNumber';
import loggly from '../../../../utils/monitoring/loggly';

const { CLIENTS } = Constants;

export class Footer extends Component {
  getDisplayPrice() {
    const { shoppingCart } = this.props;
    const { items } = shoppingCart || {};
    let totalPrice = 0;

    (items || []).forEach(item => {
      totalPrice += item.displayPrice * item.quantity;
    });

    return totalPrice;
  }

  getLoginStatus = async () => {
    const { isLogin, appActions } = this.props;

    if (isLogin) return true;

    if (Utils.isWebview()) {
      await appActions.loginByBeepApp();
      return this.props.isLogin;
    }

    if (Utils.isTNGMiniProgram()) {
      await appActions.loginByTngMiniProgram();
      return this.props.isLogin;
    }

    // By default
    return false;
  };

  handleRedirect = async () => {
    loggly.log('footer.place-order');

    const client = Utils.getClient();

    if (client === CLIENTS.WEB) {
      this.handleWebRedirect();
      return;
    }

    // For non-web users, we need to check login status
    const isLogin = await this.getLoginStatus();

    if (isLogin) this.handleWebRedirect();
  };

  handleWebRedirect = () => {
    const { history, deliverInfo } = this.props;
    const { enablePreOrder } = deliverInfo;
    const { search } = window.location;
    if (enablePreOrder) {
      const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
      const { date, hour } = Utils.getExpectedDeliveryDateFromSession();

      if (
        (Utils.isDeliveryType() && (!deliveryToAddress || !date.date || !hour)) ||
        (Utils.isPickUpType() && (!date.date || !hour.from))
      ) {
        const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_CART}${search}`);

        history.push({
          pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
          search: `${search}&callbackUrl=${callbackUrl}`,
        });
        return;
      }
    }

    return history && history.push({ pathname: Constants.ROUTER_PATHS.ORDERING_CART, search });
  };

  render() {
    const {
      onShownCartListDrawer,
      cartBilling,
      businessInfo,
      tableId,
      onToggle,
      onClickOrderNowButton,
      t,
      isValidTimeToOrder,
      isLiveOnline,
      enablePreOrder,
      footerRef,
      style,
      isUserLoginRequestStatusInPending,
      cartProductsCount,
      enablePayLater,
    } = this.props;
    const { qrOrderingSettings } = businessInfo || {};
    const { minimumConsumption } = qrOrderingSettings || {};
    const { count } = cartBilling || {};
    const cartItemsCount = enablePayLater ? cartProductsCount : count;
    const disabledViewCartButton = enablePayLater
      ? cartItemsCount <= 0
      : (Utils.isDeliveryType() && this.getDisplayPrice() < Number(minimumConsumption || 0)) ||
        this.getDisplayPrice() <= 0 ||
        (!isValidTimeToOrder && !enablePreOrder) ||
        !isLiveOnline ||
        isUserLoginRequestStatusInPending;

    return (
      <footer
        ref={footerRef}
        className="footer padding-small flex flex-middle flex-space-between flex__shrink-fixed"
        style={style}
        data-heap-name="ordering.home.footer.container"
      >
        <button
          className="home-cart__back-button button text-left margin-top-bottom-smaller margin-left-right-small flex flex-middle flex-center flex__shrink-fixed"
          data-heap-name="ordering.home.footer.cart-btn"
          onClick={onShownCartListDrawer}
        >
          <div className="home-cart__icon-container text-middle">
            <IconCart className={`home-cart__icon-cart icon icon__white ${cartItemsCount !== 0 ? 'non-empty' : ''}`} />
            {cartItemsCount ? <span className="home-cart__items-number text-center">{cartItemsCount}</span> : null}
          </div>
          {enablePayLater ? null : (
            <div className="home-cart__amount padding-left-right-normal text-middle text-left text-weight-bolder">
              <CurrencyNumber className="text-weight-bolder" money={this.getDisplayPrice() || 0} />
              {Utils.isDeliveryType() && this.getDisplayPrice() < Number(minimumConsumption || 0) ? (
                <label className="home-cart__money-minimum margin-top-bottom-smaller">
                  {cartItemsCount ? (
                    <Trans i18nKey="RemainingConsumption" minimumConsumption={minimumConsumption}>
                      <span className="text-opacity">Remaining</span>
                      <CurrencyNumber
                        className="text-opacity"
                        money={Number(minimumConsumption || 0) - this.getDisplayPrice()}
                      />
                    </Trans>
                  ) : (
                    <Trans i18nKey="MinimumConsumption" minimumConsumption={minimumConsumption}>
                      <span className="text-opacity">Min</span>
                      <CurrencyNumber
                        className="text-opacity"
                        money={Number(minimumConsumption || 0) - this.getDisplayPrice()}
                      />
                    </Trans>
                  )}
                </label>
              ) : null}
            </div>
          )}
        </button>
        {tableId !== 'DEMO' ? (
          <button
            className="home-cart__order-button button button__fill padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder flex__fluid-content"
            data-testid="orderNow"
            data-heap-name="ordering.home.footer.order-btn"
            disabled={disabledViewCartButton}
            onClick={async () => {
              onClickOrderNowButton();
              onToggle();
              await this.handleRedirect();
            }}
          >
            {enablePayLater
              ? t('ReviewCart')
              : isLiveOnline
              ? !isValidTimeToOrder && enablePreOrder
                ? t('PreOrderNow')
                : t('OrderNow')
              : t('StoreOffline')}
          </button>
        ) : null}
      </footer>
    );
  }
}
Footer.displayName = 'OrderingFooter';

Footer.propTypes = {
  footerRef: PropTypes.any,
  enablePayLater: PropTypes.bool,
  tableId: PropTypes.string,
  onToggle: PropTypes.func,
  onShownCartListDrawer: PropTypes.func,
  onClickOrderNowButton: PropTypes.func,
  isValidTimeToOrder: PropTypes.bool,
  enablePreOrder: PropTypes.bool,
  style: PropTypes.object,
};

Footer.defaultProps = {
  enablePayLater: false,
  onToggle: () => {},
  onShownCartListDrawer: () => {},
  onClickOrderNowButton: () => {},
  isValidTimeToOrder: true,
  enablePreOrder: false,
};

export default compose(
  withTranslation(['OrderingHome']),
  connect(
    state => {
      return {
        cartBilling: getCartBilling(state),
        businessInfo: getBusinessInfo(state),
        shoppingCart: getShoppingCart(state),
        categories: getCategoryProductList(state),
        user: getUser(state),
        isLogin: getUserIsLogin(state),
        deliverInfo: getDeliveryInfo(state),
        isUserLoginRequestStatusInPending: getIsUserLoginRequestStatusInPending(state),
        cartProductsCount: getCartItemsCount(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Footer);
