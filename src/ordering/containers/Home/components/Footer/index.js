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
import { getBusiness } from '../../../../redux/modules/app';
import { getAllBusinesses } from '../../../../../redux/modules/entities/businesses';
import Utils from '../../../../../utils/utils';
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

  handleRedirect = () => {
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
          className="button button__block text-left margin-top-bottom-smallest margin-left-right-smaller flex flex-middle"
          data-heap-name="ordering.home.footer.cart-btn"
          onClick={onClickCart}
        >
          <div className="home-cart__icon-container text-middle">
            <IconCart className={`home-cart__icon-cart icon ${count !== 0 ? 'non-empty' : ''}`} />
            {count ? <span className="home-cart__items-number text-center">{count}</span> : null}
          </div>

          <div className="home-cart__amount padding-left-right-normal text-middle text-left text-weight-bolder">
            <CurrencyNumber className="text-weight-bolder" money={this.getDisplayPrice() || 0} />
            {Utils.isDeliveryType() && this.getDisplayPrice() < Number(minimumConsumption || 0) ? (
              <label className="home-cart__money-minimum margin-top-bottom-smallest">
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
            className="home-cart__order-button button button__fill padding-normal margin-top-bottom-smallest margin-left-right-smaller text-uppercase text-weight-bolder flex__shrink-fixed"
            data-testid="orderNow"
            data-heap-name="ordering.home.footer.order-btn"
            disabled={
              (Utils.isDeliveryType() && this.getDisplayPrice() < Number(minimumConsumption || 0)) ||
              (!Utils.isDeliveryType() && this.getDisplayPrice() <= 0) ||
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
        allBusinessInfo: getAllBusinesses(state),
      };
    },
    dispatch => ({
      cartActions: bindActionCreators(cartActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(Footer);
