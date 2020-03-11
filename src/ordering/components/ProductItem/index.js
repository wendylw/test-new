import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Item from '../../../components/Item';
import Tag from '../../../components/Tag';
import ItemOperator from '../../../components/ItemOperator';
import CurrencyNumber from '../../components/CurrencyNumber';

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
    } = this.props;

    return (
      <Item
        className={className}
        contentClassName="flex-top"
        productDetailImageRef={productDetailImageRef}
        image={image}
        title={title}
        variation={variation}
        detail={<CurrencyNumber className="price item__text font-weight-bold gray-font-opacity" money={price || 0} />}
        operateItemDetail={showProductDetail}
        hasTag={isFeaturedProduct}
      >
        {soldOut ? (
          <Tag text={t('SoldOut')} className="tag__card sold-out" style={{ minWidth: '70px' }} />
        ) : (
          <ItemOperator
            className="flex-middle"
            quantity={cartQuantity}
            decreaseDisabled={decreaseDisabled}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
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
  onDecrease: () => {},
  onIncrease: () => {},
  showProductDetail: () => {},
};

export default withTranslation()(ProductItem);
