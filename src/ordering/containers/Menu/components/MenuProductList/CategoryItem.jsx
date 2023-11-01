import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useInView } from 'react-hook-inview';
import { ObjectFitImage } from '../../../../../common/components/Image';
import Badge from '../../../../../common/components/Badge';
import Tag from '../../../../../common/components/Tag';
import IconBestSellerImage from '../../../../../images/bestseller.svg';
import { productItemClicked } from '../../redux/productDetail/thunks';
import styles from './MenuProductList.module.scss';

const ProductListProps = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string, // product id
    title: PropTypes.string, // product title
    description: PropTypes.string, // product description, Api hasn't this data for now
    image: PropTypes.string, // product image URL, if no image will return null
    formattedDisplayPrice: PropTypes.string, // product unit price with formatter, for example: "100.00"
    formattedOriginalDisplayPrice: PropTypes.string, // product original display price, if hasn't, return “”, for example: "106.00"
    isSoldOut: PropTypes.bool, // is product sold out
    cartQuantity: PropTypes.number, // product quantity in cart
    isBestSeller: PropTypes.bool, // is Best seller
  })
);

const BestSellerCategoryProductList = ({ products, categoryId }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <ul className={styles.bestSellerCategoryProductList}>
      {products.map(product =>
        !product.image ? null : (
          <li
            key={`bestSellerProductItem-${product.id}`}
            className={styles.menuProductItem}
            data-test-id="ordering.menu.product-list.best-seller-product-item"
            onClick={() => {
              dispatch(productItemClicked({ productId: product.id, categoryId }));
            }}
          >
            <div
              className={`tw-relative tw-p-4 sm:tw-p-4px ${
                product.isSoldOut ? styles.menuProductItemContentDisabled : ''
              }`}
            >
              <div className={styles.menuProductItemImageContainer}>
                <ObjectFitImage className="tw-rounded" src={product.image} dimension="500x500" />
              </div>
              <h4
                className={`${styles.menuProductItemTitle} tw-px-2 sm:tw-px-2px tw-mt-8 sm:tw-mt-8px tw-font-bold tw-leading-relaxed`}
              >
                {product.title}
              </h4>
              <div className="tw-flex tw-flex-wrap tw-items-center tw-px-2 sm:tw-px-2px tw-my-4 sm:tw-my-4px">
                <span className={styles.menuProductItemPrice}>{product.formattedDisplayPrice}</span>
                {product.formattedOriginalDisplayPrice && (
                  <span className={`${styles.menuProductItemPrice} tw-line-through tw-text-gray-900 tw-opacity-40`}>
                    {product.formattedOriginalDisplayPrice}
                  </span>
                )}
                {product.isSoldOut ? (
                  <Tag className="tw-flex-shrink-0 tw-ml-4 sm:tw-ml-4px tw-font-bold tw-uppercase">{t('SoldOut')}</Tag>
                ) : null}
              </div>
              {product.cartQuantity ? (
                <Badge className={styles.menuProductItemCartQuantity} value={product.cartQuantity} />
              ) : null}
            </div>
          </li>
        )
      )}
    </ul>
  );
};

BestSellerCategoryProductList.displayName = 'BestSellerCategoryProductList';
BestSellerCategoryProductList.propTypes = {
  categoryId: PropTypes.string.isRequired,
  products: ProductListProps.isRequired,
};

const CategoryProductList = ({ products, categoryId }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <ul className={styles.categoryProductList}>
      {products.map(product => (
        <li
          key={product.id}
          className={`${styles.menuProductItem} tw-mx-8 sm:tw-mx-8px`}
          data-test-id="ordering.menu.product-list.product-item"
          onClick={() => {
            dispatch(productItemClicked({ productId: product.id, categoryId }));
          }}
        >
          <div
            className={`tw-relative tw-p-4 sm:tw-p-4px tw-my-12 sm:tw-my-12px ${
              product.isSoldOut ? styles.menuProductItemContentDisabled : ''
            } ${product.image ? '' : styles.menuProductItemNoImage}`}
          >
            <div className="tw-flex tw-flex-1">
              <div className="tw-flex-auto tw-relative">
                <div className="tw-px-2 sm:tw-px-2px">
                  {product.isBestSeller ? (
                    <img
                      className={styles.menuProductItemBestSellerTag}
                      src={IconBestSellerImage}
                      alt="StoreHub Beep best seller"
                    />
                  ) : null}
                  <h4 className={`${styles.menuProductItemTitle} tw-font-bold tw-leading-relaxed`}>{product.title}</h4>
                  {product.description && (
                    <p
                      className={`${styles.menuProductItemDescription} tw-my-6 sm:tw-my-6px tw-text-gray-700 tw-leading-loose tw-text-sm`}
                    >
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="tw-flex tw-items-center tw-mt-8 sm:tw-mt-8px tw-mb-4 sm:tw-mb-4px">
                  <span className={styles.menuProductItemPrice}>{product.formattedDisplayPrice}</span>
                  {product.formattedOriginalDisplayPrice && (
                    <span className={`${styles.menuProductItemPrice} tw-line-through tw-text-gray-900 tw-opacity-40`}>
                      {product.formattedOriginalDisplayPrice}
                    </span>
                  )}
                  {product.isSoldOut ? (
                    <Tag className="tw-mx-8 sm:tw-mx-8px tw-font-bold tw-uppercase">{t('SoldOut')}</Tag>
                  ) : null}
                </div>
              </div>
              {product.image && (
                <div
                  className={`${styles.menuProductItemImageContainer} tw-ml-16 sm:tw-ml-16px tw-flex-shrink-0 tw-w-3/10`}
                >
                  <ObjectFitImage className="tw-rounded" src={product.image} loading="lazy" />
                </div>
              )}
            </div>
            {product.cartQuantity ? (
              <Badge className={styles.menuProductItemCartQuantity} value={product.cartQuantity} />
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
};

CategoryProductList.displayName = 'CategoryProductList';
CategoryProductList.propTypes = {
  categoryId: PropTypes.string.isRequired,
  products: ProductListProps.isRequired,
};

const generateScrollHandleId = id => `menu__category-scroll-handle--${id}`;

const CategoryItem = ({ category, onIntersectionChange, products }) => {
  // this is not accurate because of the responsive padding, but good enough for now
  const categoryBarHeight = 72;
  const [ref, isVisible] = useInView({
    rootMargin: `-${categoryBarHeight}px 0px 0px 0px`,
  });
  useEffect(() => {
    if (onIntersectionChange) {
      onIntersectionChange({ inView: isVisible, categoryId: category.id });
    }
  }, [onIntersectionChange, isVisible, category.id]);

  return (
    <div className="tw-pb-16 sm:tw-pb-16px tw-relative" ref={ref}>
      {/* used for spare the space that the sticky category bar when use scroll the category into view */}
      <div
        id={generateScrollHandleId(category.id)}
        className="tw-absolute tw-w-0 tw-h-0 tw-left-0 tw-pointer-events-none"
        style={{ top: -categoryBarHeight }}
      />
      <h2 className="tw-text-xl tw-font-bold tw-mx-16 sm:tw-mx-16px tw-py-8 sm:tw-py-8px tw-leading-normal">
        {category.name}
      </h2>
      {category.isBestSeller ? (
        <BestSellerCategoryProductList products={products} categoryId={category.id} />
      ) : (
        <CategoryProductList products={products} categoryId={category.id} />
      )}
    </div>
  );
};

CategoryItem.displayName = 'CategoryItem';
CategoryItem.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string,
    isActive: PropTypes.bool,
    isBestSeller: PropTypes.bool,
    name: PropTypes.string,
    cartQuantity: PropTypes.number,
  }).isRequired,
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string, // product id
      title: PropTypes.string, // product title
      description: PropTypes.string, // product description, Api hasn't this data for now
      image: PropTypes.string, // product image URL, if no image will return null
      formattedDisplayPrice: PropTypes.string, // product unit price with formatter, for example: "100.00"
      formattedOriginalDisplayPrice: PropTypes.string, // product original display price, if hasn't, return “”, for example: "106.00"
      isSoldOut: PropTypes.bool, // is product sold out
      cartQuantity: PropTypes.number, // product quantity in cart
      isBestSeller: PropTypes.bool, // is Best seller
    })
  ).isRequired,
  onIntersectionChange: PropTypes.func,
};
CategoryItem.defaultProps = {
  onIntersectionChange: () => {},
};

export default CategoryItem;
