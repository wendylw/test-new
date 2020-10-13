import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Item from '../../../components/Item';
import Tag from '../../../components/Tag';
import ItemOperator from '../../../components/ItemOperator';
import CurrencyNumber from '../../components/CurrencyNumber';

import { connect } from 'react-redux';
import { compose } from 'redux';
import { getProductItemMinHeight } from '../../redux/modules/home';

import './ProductItem.scss';

export class ProductItem extends Component {
  render() {
    const {
      t,
      className,
      variation,
      image,
      title,
      price,
      originalDisplayPrice,
      soldOut,
      cartQuantity,
      decreaseDisabled,
      onDecrease,
      onIncrease,
      isFeaturedProduct,
      showProductDetail,
      productDetailImageRef,
      isValidTimeToOrder,
      isLazyLoad,
      productItemMinHeight,
      scrollContainer,
      showOperator,
    } = this.props;
    const PricesDom = (
      <div>
        {originalDisplayPrice ? (
          <CurrencyNumber
            className="product-item__price text-size-small text-line-through"
            money={originalDisplayPrice}
            numberOnly={true}
          />
        ) : null}
        <CurrencyNumber
          className={`product-item__price ${originalDisplayPrice ? 'text-error' : ''}`}
          money={price || 0}
          numberOnly={true}
        />
      </div>
    );

    return (
      <Item
        scrollContainer={scrollContainer}
        isLazyLoad={isLazyLoad}
        productItemMinHeight={productItemMinHeight}
        className={className}
        productDetailImageRef={productDetailImageRef}
        image={image}
        title={title}
        variation={variation}
        detail={PricesDom}
        operateItemDetail={showProductDetail}
        tagText={isFeaturedProduct ? t('BestSeller') : null}
        data-heap-name="ordering.common.product-item.container"
      >
        {soldOut ? (
          <Tag text={t('SoldOut')} className="product-item__tag tag tag__default text-size-big" />
        ) : showOperator ? (
          <ItemOperator
            className="flex-middle"
            data-heap-name="ordering.common.product-item.item-operator"
            quantity={cartQuantity}
            decreaseDisabled={decreaseDisabled}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            increaseDisabled={!isValidTimeToOrder}
          />
        ) : cartQuantity > 0 ? (
          <span className="product-item__selected  text-size-small">{t('Selected', { quantity: cartQuantity })}</span>
        ) : null}
      </Item>
    );
  }
}

ProductItem.propTypes = {
  className: PropTypes.string,
  variation: PropTypes.string,
  soldOut: PropTypes.bool,
  image: PropTypes.string,
  title: PropTypes.string,
  price: PropTypes.number,
  originalDisplayPrice: PropTypes.number,
  cartQuantity: PropTypes.number,
  decreaseDisabled: PropTypes.bool,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
  showProductDetail: PropTypes.func,
  productDetailImageRef: PropTypes.any,
  isValidTimeToOrder: PropTypes.bool,
  isLazyLoad: PropTypes.bool,
  showOperator: PropTypes.bool,
};

ProductItem.defaultProps = {
  className: '',
  variation: '',
  soldOut: false,
  image: '',
  title: '',
  price: 0,
  originalDisplayPrice: 0,
  cartQuantity: 0,
  decreaseDisabled: false,
  isValidTimeToOrder: true,
  isLazyLoad: true,
  showOperator: true,
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
