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

    if (enablePreOrder && Utils.isDeliveryType()) {
      const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
      const { date, hour } = Utils.getExpectedDeliveryDateFromSession();

      if (!deliveryToAddress || !date.date || !hour) {
        const { search } = window.location;
        Utils.setSessionVariable(
          'deliveryTimeCallbackUrl',
          JSON.stringify({
            pathname: Constants.ROUTER_PATHS.ORDERING_CART,
            search,
          })
        );

        history.push({
          pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
          search,
        });
        return;
      }
    }

    return history && history.push({ pathname: Constants.ROUTER_PATHS.ORDERING_CART, search: window.location.search });
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
    } = this.props;
    const { qrOrderingSettings } = businessInfo || {};
    const { minimumConsumption } = qrOrderingSettings || {};
    const { count } = cartSummary || {};

    return (
      <footer className="footer-operation flex flex-middle flex-space-between">
        <div className="cart-bar has-products flex flex-middle flex-space-between">
          <button onClick={onClickCart}>
            <div className={`cart-bar__icon-container text-middle ${count === 0 ? 'empty' : ''}`}>
              <IconCart />
              <span className="tag__number">{count || 0}</span>
            </div>

            <div className="cart-bar__money text-middle text-left">
              <CurrencyNumber className="font-weight-bold" money={this.getDisplayPrice() || 0} />
              {this.getDisplayPrice() < Number(minimumConsumption || 0) ? (
                <label className="cart-bar__money-minimum">
                  {count ? (
                    <Trans i18nKey="RemainingConsumption" minimumConsumption={minimumConsumption}>
                      <span className="gray-font-opacity">Remaining</span>
                      <CurrencyNumber
                        className="gray-font-opacity"
                        money={Number(minimumConsumption || 0) - this.getDisplayPrice()}
                      />
                    </Trans>
                  ) : (
                    <Trans i18nKey="MinimumConsumption" minimumConsumption={minimumConsumption}>
                      <span className="gray-font-opacity">Min</span>
                      <CurrencyNumber
                        className="gray-font-opacity"
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
              className="cart-bar__order-button"
              disabled={
                this.getDisplayPrice() < Number(minimumConsumption || 0) ||
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
        </div>
      </footer>
    );
  }
}

Footer.propTypes = {
  tableId: PropTypes.string,
  onToggle: PropTypes.func,
  onClickCart: PropTypes.func,
  isValidTimeToOrder: PropTypes.bool,
  enablePreOrder: PropTypes.bool,
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
