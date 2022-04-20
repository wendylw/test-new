/* eslint-disable react/forbid-prop-types */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import Image from '../../../../../components/Image';
import styles from './ProductCard.module.scss';

const ProductCard = ({ className, product }) => {
  const title = useMemo(() => _get(product, 'title', ''), [product]);
  const images = useMemo(() => _get(product, 'images', []), [product]);
  const price = useMemo(() => (Math.floor(_get(product, 'price', 0) * 100) / 100).toFixed(2), [product]);

  const classNameList = [styles.ProductCardContainer, 'text-size-reset'];

  if (className) {
    classNameList.push(className);
  }

  return (
    <div className={classNameList.join(' ')}>
      <Image className={styles.ProductCardImageContainer} src={images[0]} />
      <div className={styles.ProductCardContentContainer}>
        <span className={`${styles.ProductCardContent} tw-font-bold`}>{title}</span>
        <span className={styles.ProductCardContent}>{price}</span>
      </div>
    </div>
  );
};

ProductCard.displayName = 'ProductCard';

ProductCard.propTypes = {
  className: PropTypes.string,
  product: PropTypes.object,
};

ProductCard.defaultProps = {
  className: '',
  product: {},
};

export default ProductCard;
