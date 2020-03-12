import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import LazyLoad from 'react-lazyload';
import Item from '../../../components/Item';
import Tag from '../../../components/Tag';
import ItemOperator from '../../../components/ItemOperator';
import CurrencyNumber from '../../components/CurrencyNumber';

export class ProductItem extends Component {
  ItemMinHeight = 190;

  componentDidMount() {
    this.setItemHeight();
  }

  setItemHeight() {
    // 33.8 equal (item padding + item image + item cart controller button height) / window width
    this.ItemMinHeight = (document.body.clientWidth || window.innerWidth) * 33.8;
  }

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
      <LazyLoad height={this.ItemMinHeight}>
        <Item
          className={className}
          contentClassName="flex-middle"
          productDetailImageRef={productDetailImageRef}
          image={image}
          title={title}
          variation={variation}
          detail={<CurrencyNumber money={price || 0} />}
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
      </LazyLoad>
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
