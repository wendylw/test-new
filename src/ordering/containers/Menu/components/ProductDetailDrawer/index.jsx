import React, { useCallback, useRef, useState, useEffect } from 'react';
import { CaretUp, X } from 'phosphor-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTimeout } from 'react-use';
import Drawer from '../../../../../common/components/Drawer';
import Loader from '../../../../../common/components/Loader';
import QuantityAdjuster from '../../../../../common/components/QuantityAdjuster';
import ImageSwiper from './ImageSwiper';
import SingleChoiceVariation from './SingleChoiceVariation';
import SimpleMultipleChoiceVariation from './SimpleMultipleChoiceVariation';
import QuantityMultipleChoiceVariation from './QuantityMultipleChoiceVariation';
import styles from './ProductDetailDrawer.module.scss';
import Button from '../../../../../common/components/Button';
import IconBestSellerImage from '../../../../../images/bestseller.svg';
import {
  getIsProductDetailDrawerVisible,
  getIsProductDetailLoading,
  getProductDetailData,
  getSelectedQuantity,
  getFormattedTotalPrice,
  getIsProductDetailDrawerFullScreen,
  getIsAddToCartLoading,
  getIsAbleAddToCart,
  getUnableAddToCartReason,
} from '../../redux/productDetail/selectors';
import {
  hideProductDetailDrawer,
  increaseProductQuantity,
  decreaseProductQuantity,
  addToCart,
} from '../../redux/productDetail/thunks';
import { PRODUCT_UNABLE_ADD_TO_CART_REASONS } from '../../constants';

const LoadingIndicator = () => {
  const [shouldShow] = useTimeout(500);
  return shouldShow() ? (
    <div className={styles.loadingIndicator}>
      <Loader size={30} color="white" />
    </div>
  ) : null;
};
LoadingIndicator.displayName = 'LoadingIndicator';

const UNABLE_ADD_TO_CART_REASON_KEY_MAP = {
  [PRODUCT_UNABLE_ADD_TO_CART_REASONS.OUT_OF_STOCK]: 'OutOfStock',
  [PRODUCT_UNABLE_ADD_TO_CART_REASONS.VARIATION_UNFULFILLED]: 'SelectVariant',
  // TODO: get the copy from PO
  [PRODUCT_UNABLE_ADD_TO_CART_REASONS.EXCEEDED_QUANTITY_ON_HAND]: 'ExceedsMaximumStock',
};

const ProductDetailDrawer = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isDrawerVisible = useSelector(getIsProductDetailDrawerVisible);
  const isProductDetailLoading = useSelector(getIsProductDetailLoading);
  const isAddToCartLoading = useSelector(getIsAddToCartLoading);
  const product = useSelector(getProductDetailData);
  const selectedQuantity = useSelector(getSelectedQuantity);
  const formattedTotalPrice = useSelector(getFormattedTotalPrice);
  const fullScreen = useSelector(getIsProductDetailDrawerFullScreen);
  const isAbleAddCart = useSelector(getIsAbleAddToCart);
  const unableAddToCartReason = useSelector(getUnableAddToCartReason);

  const contentRef = useRef();
  const imageSectionRef = useRef();
  const [showTopArrow, setShowTopArrow] = useState(false);

  useEffect(() => {
    if (!isDrawerVisible) {
      setShowTopArrow(false);
    }
  }, [isDrawerVisible]);
  const onContentScroll = useCallback(() => {
    if (!contentRef.current || !imageSectionRef.current) {
      return;
    }
    // if no image, show the top arrow when scroll distance reaches 100px.
    if (contentRef.current.scrollTop > Math.max(imageSectionRef.current.offsetHeight, 100)) {
      setShowTopArrow(true);
    } else {
      setShowTopArrow(false);
    }
  }, []);
  const onTopArrowClick = useCallback(() => {
    if (showTopArrow && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [showTopArrow]);
  const onClose = useCallback(() => {
    dispatch(hideProductDetailDrawer());
  }, [dispatch]);

  return (
    <>
      {isProductDetailLoading && <LoadingIndicator />}
      <Drawer
        show={isDrawerVisible}
        fullScreen={fullScreen}
        className={styles.productDetailDrawer}
        onClose={() => {
          onClose();
        }}
      >
        <button
          className={styles.topArrowBtn}
          onClick={onTopArrowClick}
          style={{
            transform: showTopArrow ? 'translateY(0)' : 'translateY(-100%)',
            pointerEvents: showTopArrow ? 'auto' : 'none',
          }}
        >
          <CaretUp className="tw-align-middle" size={20} weight="thin" />
        </button>

        <div className={styles.productDetailWrapper}>
          <div className={styles.productDetailContent} ref={contentRef} onScroll={onContentScroll}>
            <section className={styles.imageSection} ref={imageSectionRef}>
              <ImageSwiper images={product.images} />
              <button
                className={styles.closeButton}
                onClick={() => {
                  onClose();
                }}
              >
                <X size={18} weight="bold" />
              </button>
            </section>
            <section className={styles.basicInfoSection}>
              {product.isBestSeller ? (
                <img className="tw-inline-block" src={IconBestSellerImage} alt="StoreHub Beep best seller" />
              ) : null}
              <div className="tw-my-4 sm:tw-my-4px tw-flex tw-items-center tw-w-full tw-flex-row">
                <h2 className="tw-font-bold tw-flex-1 tw-text-xl tw-leading-normal">{product.title}</h2>
                <div className="tw-flex-shrink-0 tw-text-xl tw-ml-8 sm:tw-ml-8px text-gray-700">
                  {product.formattedDisplayPrice}
                </div>
              </div>
              <p className={styles.productDescription} dangerouslySetInnerHTML={{ __html: product.description }} />
            </section>
            <section className={styles.variationSection}>
              {product.variations.map(variation =>
                variation.type === 'SingleChoice' ? (
                  <SingleChoiceVariation key={variation.id} variation={variation} />
                ) : variation.type === 'SimpleMultipleChoice' ? (
                  <SimpleMultipleChoiceVariation key={variation.id} variation={variation} />
                ) : variation.type === 'QuantityMultipleChoice' ? (
                  <QuantityMultipleChoiceVariation key={variation.id} variation={variation} />
                ) : null
              )}
            </section>
            <section className={styles.quantitySection}>
              <QuantityAdjuster
                size="large"
                value={selectedQuantity}
                increaseDisabled={!product.isAbleToIncreaseQuantity}
                decreaseDisabled={!product.isAbleToDecreaseQuantity}
                onChange={delta => {
                  if (delta > 0) {
                    dispatch(increaseProductQuantity());
                  } else if (delta < 0) {
                    dispatch(decreaseProductQuantity());
                  }
                }}
              />
              {product.stockStatus === 'lowStock' && typeof product.quantityOnHand === 'number' ? (
                <em className="tw-block tw-text-red tw-text-sm tw-not-italic tw-p-8px">
                  {t('XItemsLeft', { amount: product.quantityOnHand })}
                </em>
              ) : null}
            </section>
          </div>
          <div className={styles.productDetailFooter}>
            {isAbleAddCart ? (
              <Button
                loading={isAddToCartLoading}
                onClick={() => {
                  dispatch(addToCart());
                }}
                className="tw-w-full"
              >
                {t('AddToCart', { price: formattedTotalPrice })}
              </Button>
            ) : (
              <Button className="tw-w-full" disabled>
                {t(UNABLE_ADD_TO_CART_REASON_KEY_MAP[unableAddToCartReason])}
              </Button>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

ProductDetailDrawer.displayName = 'ProductDetailDrawer';
ProductDetailDrawer.propTypes = {};
ProductDetailDrawer.defaultProps = {};

export default ProductDetailDrawer;