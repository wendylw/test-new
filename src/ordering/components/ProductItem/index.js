import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import LazyLoad from 'react-lazyload';
import Item from '../../../components/Item';
import Tag from '../../../components/Tag';
import ItemOperator from '../../../components/ItemOperator';
import CurrencyNumber from '../../components/CurrencyNumber';

import { connect } from 'react-redux';
import { compose } from 'redux';
import { getProductItemMinHeight } from '../../redux/modules/home';

export class ProductItem extends Component {
  renderItem() {
    const {
      t,
      className,
      variation,
      image,
      title,
      price,
      soldOut,
      cartQuantity,
      decreaseDisabled,
      onDecrease,
      onIncrease,
      isFeaturedProduct,
      showProductDetail,
      productDetailImageRef,
      isValidTimeToOrder,
    } = this.props;

    return (
      <Item
        className={className}
        contentClassName="flex-top"
        productDetailImageRef={productDetailImageRef}
        image={image}
        title={title}
        variation={variation}
        detail={<CurrencyNumber className="price item__text font-weight-bolder" money={price || 0} numberOnly={true} />}
        operateItemDetail={showProductDetail}
        hasTag={isFeaturedProduct}
        data-heap-name="ordering.common.product-item.container"
      >
        {soldOut ? (
          <Tag text={t('SoldOut')} className="tag__card info sold-out" style={{ minWidth: '70px' }} />
        ) : (
          <ItemOperator
            className="flex-middle"
            data-heap-name="ordering.common.product-item.item-operator"
            quantity={cartQuantity}
            decreaseDisabled={decreaseDisabled}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            increaseDisabled={!isValidTimeToOrder}
          />
        )}
      </Item>
    );
  }

  render() {
    const { isList, productItemMinHeight } = this.props;

    return isList ? <LazyLoad height={productItemMinHeight}>{this.renderItem()}</LazyLoad> : this.renderItem();
  }
}

ProductItem.propTypes = {
  className: PropTypes.string,
  variation: PropTypes.string,
  soldOut: PropTypes.bool,
  image: PropTypes.string,
  title: PropTypes.string,
  price: PropTypes.number,
  cartQuantity: PropTypes.number,
  decreaseDisabled: PropTypes.bool,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
  showProductDetail: PropTypes.func,
  productDetailImageRef: PropTypes.any,
  isValidTimeToOrder: PropTypes.bool,
  isList: PropTypes.bool,
};

ProductItem.defaultProps = {
  className: '',
  variation: '',
  soldOut: false,
  image: '',
  title: '',
  price: 0,
  cartQuantity: 0,
  decreaseDisabled: false,
  isValidTimeToOrder: true,
  isList: true,
  productItemMinHeight: 100,
  onDecrease: () => {},
  onIncrease: () => {},
  showProductDetail: () => {},
};

export default compose(
  withTranslation(),
  connect(
    state => {
      return {
        productItemMinHeight: getProductItemMinHeight(state),
      };
    },
    dispatch => ({})
  )
)(ProductItem);
