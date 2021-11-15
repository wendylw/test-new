import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import HybridHeader from '../../../../../components/HybridHeader';
import Utils from '../../../../../utils/utils';
import { ProductSoldOutModal } from '../../components/ProductSoldOutModal';
import IconDeleteImage from '../../../../../images/icon-delete.svg';
import CleverTap from '../../../../../utils/clevertap';
import PayFirst from '../PayFirst';
import PayLater from '../PayLater';

class Cart extends Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    isHaveProductSoldOut: Utils.getSessionVariable('isHaveProductSoldOut'),
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
        {/* 缺条件 暂时放一个 假条件 */}
        {1 ? <PayFirst /> : <PayLater />}
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

Cart.displayName = 'Cart';

/* TODO: backend data */
export default compose(withTranslation(['OrderingCart', 'OrderingPromotion']))(Cart);
