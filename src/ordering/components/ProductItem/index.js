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
    } = this.props;

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
        detail={<CurrencyNumber className="price text-opacity" money={price || 0} numberOnly={true} />}
        operateItemDetail={showProductDetail}
        tagText={isFeaturedProduct ? t('BestSeller') : null}
        data-heap-name="ordering.common.product-item.container"
      >
        {soldOut ? (
          <Tag text={t('SoldOut')} className="product-item__tag tag tag__default text-size-big" />
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
  isLazyLoad: PropTypes.bool,
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
  isLazyLoad: true,
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
