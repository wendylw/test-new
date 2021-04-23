import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { IconCart } from '../../../../../components/Icons';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import Constants from '../../../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getCartSummary } from '../../../../../redux/modules/entities/carts';
import { actions as cartActionCreators, getBusinessInfo } from '../../../../redux/modules/cart';
import { actions as homeActionCreators, getShoppingCart, getCategoryProductList } from '../../../../redux/modules/home';
import { actions as appActionCreators, getBusiness, getUser } from '../../../../redux/modules/app';
import { getAllBusinesses } from '../../../../../redux/modules/entities/businesses';
import Utils from '../../../../../utils/utils';
import { del, get } from '../../../../../utils/request';
import Url from '../../../../../utils/url';
import dsbridge from 'dsbridge';
import DsbridgeUtils, { NATIVE_METHODS } from '../../../../../utils/dsbridge-methods';

export class Footer extends Component {
  constructor(props) {
    super(props);
    // 注册方法应该想办法放到最外层
    DsbridgeUtils.dsRegReceiveTokenListener({ callback: async res => await this.authTokens(res) });
  }

  componentDidUpdate(prevProps) {
    const { user } = this.props;
    const { isExpired, isWebview } = user || {};

    // token过期重新发postMessage
    if (isExpired && prevProps.user.isExpired !== isExpired && isWebview) {
      this.postAppMessage(user);
    }
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

  authTokens = async res => {
    if (res) {
      if (Utils.isIOSWebview()) {
        await this.loginBeepApp(res);
      } else if (Utils.isAndroidWebview()) {
        const data = JSON.parse(res) || {};
        await this.loginBeepApp(data);
      }
    }
  };

  getLoginOrNot = async () => {
    const res = await get(Url.API_URLS.GET_LOGIN_STATUS.url);
    const { login } = res;
    return login;
  };

  getKongTokenFromNative = async () => {
    await del(Url.API_URLS.LOGOUT.url);
  };

  loginBeepApp = async res => {
    const { appActions } = this.props;
    let isLogin = await this.getLoginOrNot();
    let isValidToken = Boolean(res.access_token && res.refresh_token);
    if (isValidToken && isLogin) {
      this.handleWebRedirect();
    } else if (isValidToken && !isLogin) {
      await appActions.loginApp({
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
      });
      isLogin = await this.getLoginOrNot();
      if (isLogin) {
        this.handleWebRedirect();
      }
    } else if (!isValidToken) {
      console.log('native token is invalid');
      this.handleInvalidAppToken();
    }
  };

  handleInvalidAppToken = () => {
    DsbridgeUtils.dsbridgeCall(NATIVE_METHODS.TOKEN_EXPIRED);
  };

  postAppMessage(user) {
    const { isExpired } = user || {};
    if (isExpired) {
      DsbridgeUtils.dsbridgeCall(NATIVE_METHODS.TOKEN_EXPIRED);
    } else {
      DsbridgeUtils.dsbridgeCall(NATIVE_METHODS.GET_ADDRESS);
    }
  }

  postAppMessage2 = () => {
    const { appActions, user } = this.props;
    const { isLogin } = user || {};
    dsbridge.call('callNativeAsync', { function: 'user_module_get_token' }, async res => {
      console.log('res', JSON.stringify(res));
      const { code, message, data } = JSON.parse(res);
      const { access_token, refresh_token } = data;
      if (!isLogin) {
        await appActions.loginApp({
          accessToken: access_token,
          refreshToken: refresh_token,
        });
        const { login } = await get(Url.API_URLS.GET_LOGIN_STATUS.url);
        if (login) {
          this.handleWebRedirect();
        }
      } else {
        this.handleWebRedirect();
      }
    });
  };

  handleRedirect = () => {
    this.postAppMessage2();
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
      onClickCart,
      cartSummary,
      businessInfo,
      tableId,
      onToggle,
      t,
      isValidTimeToOrder,
      isLiveOnline,
      enablePreOrder,
      footerRef,
      style,
    } = this.props;
    const { qrOrderingSettings } = businessInfo || {};
    const { minimumConsumption } = qrOrderingSettings || {};
    const { count } = cartSummary || {};
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
          onClick={onClickCart}
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
  onClickCart: PropTypes.func,
  isValidTimeToOrder: PropTypes.bool,
  enablePreOrder: PropTypes.bool,
  style: PropTypes.object,
};

Footer.defaultProps = {
  onToggle: () => {},
  onClickCart: () => {},
  isValidTimeToOrder: true,
  enablePreOrder: false,
};

export default compose(
  withTranslation(['OrderingHome']),
  connect(
    state => {
      return {
        cartSummary: getCartSummary(state),
        businessInfo: getBusinessInfo(state),
        shoppingCart: getShoppingCart(state),
        categories: getCategoryProductList(state),
        business: getBusiness(state),
        user: getUser(state),
        allBusinessInfo: getAllBusinesses(state),
      };
    },
    dispatch => ({
      cartActions: bindActionCreators(cartActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Footer);
