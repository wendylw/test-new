/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions as appActionCreators } from '../../../../redux/modules/app';
import HybridHeader from '../../../../../components/HybridHeader';
import Utils from '../../../../../utils/utils';
import { ProductSoldOutModal } from '../../components/ProductSoldOutModal';
import IconDeleteImage from '../../../../../images/icon-delete.svg';
import CleverTap from '../../../../../utils/clevertap';
import Constants from '../../../../../utils/constants';
import PayLater from '../PayLater';
import loggly from '../../../../../utils/monitoring/loggly';
import '../../OrderingCart.scss';

class Cart extends Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    isHaveProductSoldOut: Utils.getSessionVariable('isHaveProductSoldOut'),
  };

  handleClickBack = async () => {
    const newSearchParams = Utils.addParamToSearch('pageRefer', 'cart');

    if (this.additionalCommentsEl) {
      await this.additionalCommentsEl.blur();
    }

    // Fixed lazy loading issue. The first item emptied when textarea focused and back to ordering page
    const timer = setTimeout(() => {
      clearTimeout(timer);

      // eslint-disable-next-line react/destructuring-assignment
      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
        // search: window.location.search,
        search: newSearchParams,
      });
    }, 100);
  };

  handleClearAll = () => {
    // eslint-disable-next-line import/no-named-as-default-member
    loggly.log('cart.clear-all-attempt');
    // eslint-disable-next-line react/prop-types
    CleverTap.pushEvent('Cart page - click clear all', this.props.storeInfoForCleverTap);
    // eslint-disable-next-line react/prop-types
    this.props.appActions.clearAll().then(() => {
      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
        search: window.location.search,
      });
    });
  };

  render() {
    // eslint-disable-next-line react/prop-types
    const { t, cartBilling, storeInfoForCleverTap } = this.props;
    const { isHaveProductSoldOut } = this.state;
    const { count } = cartBilling || {};

    return (
      <section className="ordering-cart flex flex-column" data-heap-name="ordering.cart.container">
        <HybridHeader
          // eslint-disable-next-line no-return-assign
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.cart.header"
          isPage
          title={t('ProductsInOrderText', { count: count || 0 })}
          navFunc={() => {
            CleverTap.pushEvent('Cart page - click back arrow', storeInfoForCleverTap);
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
        />
        <PayLater history={this.props.history} />
        <ProductSoldOutModal
          t={t}
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

Cart.displayName = 'Cart';

/* TODO: backend data */
export default compose(
  withTranslation(['OrderingCart', 'OrderingPromotion']),
  connect(
    // eslint-disable-next-line no-unused-vars
    state => ({}),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Cart);
