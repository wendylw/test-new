import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation, Trans } from 'react-i18next';
import Constants from '../../../../utils/constants';
import { actions as homeActionCreators, getCategoryProductList } from '../../../redux/modules/home';
import {
  actions as appActionCreators,
  getBusiness,
  getUser,
  getShoppingCart,
  getCartBilling,
  getBusinessInfo,
} from '../../../redux/modules/app';
import { getAllBusinesses } from '../../../../redux/modules/entities/businesses';
import Utils from '../../../../utils/utils';
import { del, get } from '../../../../utils/request';
import Url from '../../../../utils/url';
import { IconCart } from '../../../../components/Icons';
import CurrencyNumber from '../../../components/CurrencyNumber';
import DsbridgeUtils, { NATIVE_METHODS } from '../../../../utils/dsbridge-methods';

export class Footer extends Component {
  componentDidUpdate = async prevProps => {
    const { user } = this.props;
    const { isExpired, isWebview, isLogin } = user || {};

    // token过期重新发postMessage
    if (isExpired && prevProps.user.isExpired !== isExpired && isWebview) {
      await this.postAppMessage();
    }
    if (isLogin && prevProps.user.isLogin !== isLogin && isWebview) {
      this.handleWebRedirect();
    }
  };

  getDisplayPrice() {
    const { shoppingCart } = this.props;
    const { items } = shoppingCart || {};
    let totalPrice = 0;

    (items || []).forEach(item => {
      totalPrice += item.displayPrice * item.quantity;
    });

    return totalPrice;
  }

  postAppMessage = async () => {
    const { appActions, user } = this.props;
    const { isLogin, isExpired } = user || {};
    const touchPoint = ['delivery', 'pickup'].includes(Utils.getOrderTypeFromUrl()) ? 'OnlineOrder' : 'QROrder';

    if (isLogin) {
      this.handleWebRedirect();
    } else {
      let res = isExpired
        ? await DsbridgeUtils.dsbridgeCall(NATIVE_METHODS.TOKEN_EXPIRED(touchPoint))
        : await DsbridgeUtils.dsbridgeCall(NATIVE_METHODS.GET_TOKEN(touchPoint));
      if (res === null || res === 'undefined') {
        console.log('native token is invalid');
      } else {
        const { access_token, refresh_token } = res;
        await appActions.loginApp({
          accessToken: access_token,
          refreshToken: refresh_token,
        });
      }
    }
  };

  handleRedirect = () => {
    const { user } = this.props;
    const { isWebview } = user || {};
    if (isWebview) {
      this.postAppMessage();
    } else {
      this.handleWebRedirect();
    }
  };

  handleWebRedirect = () => {
    const { history, business, allBusinessInfo } = this.props;
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });
    if (enablePreOrder) {
      const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
      const { date, hour } = Utils.getExpectedDeliveryDateFromSession();

      if (
        (Utils.isDeliveryType() && (!deliveryToAddress || !date.date || !hour)) ||
        (Utils.isPickUpType() && (!date.date || !hour.from))
      ) {
        const { search } = window.location;
        const newSearch = Utils.removeParam('pageRefer', search);

        const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_CART}${newSearch}`);

        history.push({
          pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
          search: `${newSearch}&callbackUrl=${callbackUrl}`,
        });
        return;
      }
    }
    const newSearchParams = Utils.removeParam('pageRefer', window.location.search);

    return history && history.push({ pathname: Constants.ROUTER_PATHS.ORDERING_CART, search: newSearchParams });
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
    } = this.props;
    console.log('isLiveOnline', isLiveOnline);
    const { qrOrderingSettings } = businessInfo || {};
    const { minimumConsumption } = qrOrderingSettings || {};
    const { count } = cartBilling || {};
    return (
      <footer
        ref={footerRef}
        className="footer padding-small flex flex-middle flex-space-between flex__shrink-fixed"
        style={style}
        data-heap-name="ordering.home.footer.container"
      >
        <button
          className="button button__block text-left margin-top-bottom-smaller margin-left-right-small flex flex-middle"
          data-heap-name="ordering.home.footer.cart-btn"
          onClick={onShownCartListDrawer}
        >
          <div className="home-cart__icon-container text-middle">
            <IconCart className={`home-cart__icon-cart icon icon__white ${count !== 0 ? 'non-empty' : ''}`} />
            {count ? <span className="home-cart__items-number text-center">{count}</span> : null}
          </div>

          <div className="home-cart__amount padding-left-right-normal text-middle text-left text-weight-bolder">
            <CurrencyNumber className="text-weight-bolder" money={this.getDisplayPrice() || 0} />
            {Utils.isDeliveryType() && this.getDisplayPrice() < Number(minimumConsumption || 0) ? (
              <label className="home-cart__money-minimum margin-top-bottom-smaller">
                {count ? (
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
        </button>
        {tableId !== 'DEMO' ? (
          <button
            className="home-cart__order-button button button__fill padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder flex__shrink-fixed"
            data-testid="orderNow"
            data-heap-name="ordering.home.footer.order-btn"
            disabled={
              (Utils.isDeliveryType() && this.getDisplayPrice() < Number(minimumConsumption || 0)) ||
              this.getDisplayPrice() <= 0 ||
              (!isValidTimeToOrder && !enablePreOrder) ||
              !isLiveOnline
            }
            onClick={() => {
              onClickOrderNowButton();
              onToggle();
              this.handleRedirect();
            }}
          >
            {isLiveOnline
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

Footer.propTypes = {
  footerRef: PropTypes.any,
  tableId: PropTypes.string,
  onToggle: PropTypes.func,
  onShownCartListDrawer: PropTypes.func,
  onClickOrderNowButton: PropTypes.func,
  isValidTimeToOrder: PropTypes.bool,
  enablePreOrder: PropTypes.bool,
  style: PropTypes.object,
};

Footer.defaultProps = {
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
        // cartBilling: getCartSummary(state),
        cartBilling: getCartBilling(state),
        businessInfo: getBusinessInfo(state),
        shoppingCart: getShoppingCart(state),
        categories: getCategoryProductList(state),
        business: getBusiness(state),
        user: getUser(state),
        allBusinessInfo: getAllBusinesses(state),
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Footer);
