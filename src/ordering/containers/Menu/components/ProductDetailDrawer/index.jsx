import React, { useCallback, useRef, useState, useEffect } from 'react';
import { CaretUp, X } from 'phosphor-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTimeout } from 'react-use';
import Drawer from '../../../../../common/components/Drawer';
import Loader from '../../../../../common/components/Loader';
import QuantityAdjuster from '../../../../../common/components/QuantityAdjuster';
import ImageSwiper from '../ImageSwiper';
import TakeawayVariation from './TakeawayVariation';
import SingleChoiceVariation from './SingleChoiceVariation';
import SimpleMultipleChoiceVariation from './SimpleMultipleChoiceVariation';
import QuantityMultipleChoiceVariation from './QuantityMultipleChoiceVariation';
import styles from './ProductDetailDrawer.module.scss';
import Button from '../../../../../common/components/Button';
import Tag from '../../../../../common/components/Tag';
import IconBestSellerImage from '../../../../../images/bestseller.svg';
import { getSelectedProductItemInfo } from '../../redux/common/selectors';
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
  getIsOutOfStockProduct,
  getIsUnavailableProduct,
  getShouldShowProductVariations,
  getIsTakeawayVariantAvailable,
  getCouldShowProductDetailDrawer,
} from '../../redux/productDetail/selectors';
import {
  addToCart,
  showProductDetailDrawer,
  hideProductDetailDrawer,
  increaseProductQuantity,
  decreaseProductQuantity,
  productDetailDrawerShown,
  productDetailDrawerHidden,
} from '../../redux/productDetail/thunks';
import { PRODUCT_UNABLE_ADD_TO_CART_REASONS } from '../../constants';
import { PRODUCT_STOCK_STATUS } from '../../../../../common/utils/constants';
import AddSpecialNotes from '../AddSpecialNotes';

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
  [PRODUCT_UNABLE_ADD_TO_CART_REASONS.OUT_OF_STOCK]: 'SoldOut',
  [PRODUCT_UNABLE_ADD_TO_CART_REASONS.VARIATION_UNFULFILLED]: 'SelectVariant',
  // TODO: get the copy from PO
  [PRODUCT_UNABLE_ADD_TO_CART_REASONS.EXCEEDED_QUANTITY_ON_HAND]: 'ExceedsMaximumStock',
  [PRODUCT_UNABLE_ADD_TO_CART_REASONS.UNAVAILABLE]: 'Unavailable',
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
  const isOutOfStockProduct = useSelector(getIsOutOfStockProduct);
  const isUnavailableProduct = useSelector(getIsUnavailableProduct);
  const selectedProductItemInfo = useSelector(getSelectedProductItemInfo);
  const couldShowProductDetailDrawer = useSelector(getCouldShowProductDetailDrawer);
  const shouldShowProductVariations = useSelector(getShouldShowProductVariations);
  const shouldShowTakeawayVariant = useSelector(getIsTakeawayVariantAvailable);

  const contentRef = useRef();
  const imageSectionRef = useRef();
  const [showTopArrow, setShowTopArrow] = useState(false);

  useEffect(() => {
    if (couldShowProductDetailDrawer) {
      dispatch(showProductDetailDrawer(selectedProductItemInfo));
    }
  }, [dispatch, couldShowProductDetailDrawer, selectedProductItemInfo]);

  useEffect(() => {
    if (!isDrawerVisible) {
      setShowTopArrow(false);
    }
  }, [isDrawerVisible]);

  useEffect(() => {
    if (isDrawerVisible) {
      dispatch(productDetailDrawerShown());
    } else {
      dispatch(productDetailDrawerHidden());
    }
  }, [dispatch, isDrawerVisible]);

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
        <Button
          block
          type="text"
          theme="ghost"
          className={styles.topArrowBtn}
          data-test-id="ordering.menu.product-detail-drawer.top-btn"
          onClick={onTopArrowClick}
          style={{
            transform: showTopArrow ? 'translateY(0)' : 'translateY(-100%)',
            pointerEvents: showTopArrow ? 'auto' : 'none',
          }}
        >
          <CaretUp className="tw-align-middle" size={16} />
        </Button>

        <div className={styles.productDetailWrapper}>
          <div className={styles.productDetailContent} ref={contentRef} onScroll={onContentScroll}>
            <section className={styles.imageSection} ref={imageSectionRef}>
              <ImageSwiper images={product.images} />
              <button
                className={styles.closeButton}
                data-test-id="ordering.menu.product-detail-drawer.close-btn"
                onClick={() => {
                  onClose();
                }}
              >
                <X size={18} weight="bold" />
              </button>
            </section>
            <section className={styles.basicInfoSection}>
              <div className={product.isBestSeller ? styles.productFeatureStatus : styles.productSoldOutStatus}>
                {product.isBestSeller ? (
                  <img className="tw-inline-block" src={IconBestSellerImage} alt="StoreHub Beep best seller" />
                ) : null}
                {isOutOfStockProduct ? (
                  <Tag className="tw-flex-shrink-0 tw-my-6 sm:tw-my-6px tw-font-bold tw-uppercase">{t('SoldOut')}</Tag>
                ) : isUnavailableProduct ? (
                  <Tag className="tw-flex-shrink-0 tw-my-6 sm:tw-my-6px tw-font-bold tw-uppercase">
                    {t('Unavailable')}
                  </Tag>
                ) : null}
              </div>
              <div className="tw-my-4 sm:tw-my-4px tw-flex tw-w-full tw-flex-row">
                <h2 className={styles.productTitle}>{product.title}</h2>
                <span className="tw-flex-shrink-0 tw-text-xl tw-ml-12 sm:tw-ml-12px text-gray-700 tw-leading-normal">
                  {product.formattedDisplayPrice}
                </span>
              </div>
              {/* eslint-disable-next-line react/no-danger */}
              <p className={styles.productDescription} dangerouslySetInnerHTML={{ __html: product.description }} />
            </section>
            {shouldShowTakeawayVariant && (
              <section className={styles.takeawayVariationSection}>
                <TakeawayVariation />
              </section>
            )}
            {shouldShowProductVariations && (
              <section className={styles.productVariationSection}>
                <div>
                  {product.variations.map(variation =>
                    variation.type === 'SingleChoice' ? (
                      <SingleChoiceVariation key={variation.id} variation={variation} />
                    ) : variation.type === 'SimpleMultipleChoice' ? (
                      <SimpleMultipleChoiceVariation key={variation.id} variation={variation} />
                    ) : variation.type === 'QuantityMultipleChoice' ? (
                      <QuantityMultipleChoiceVariation key={variation.id} variation={variation} />
                    ) : null
                  )}
                </div>
              </section>
            )}
            <section className={styles.itemNoteSection}>
              <AddSpecialNotes />
            </section>
            <section className={styles.quantitySection}>
              <QuantityAdjuster
                size="large"
                value={selectedQuantity}
                increaseDisabled={!product.isAbleToIncreaseQuantity}
                decreaseDisabled={!product.isAbleToDecreaseQuantity}
                data-test-id="ordering.menu.product-detail-drawer.quantity-adjuster"
                onChange={delta => {
                  if (delta > 0) {
                    dispatch(increaseProductQuantity());
                  } else if (delta < 0) {
                    dispatch(decreaseProductQuantity());
                  }
                }}
              />
              {product.stockStatus === PRODUCT_STOCK_STATUS.LOW_STOCK && typeof product.quantityOnHand === 'number' ? (
                <em className="tw-block tw-text-red tw-text-sm tw-not-italic tw-p-8px">
                  {t('XItemsLeft', { amount: product.quantityOnHand })}
                </em>
              ) : null}
            </section>
          </div>
          <div className={styles.productDetailFooter}>
            {isAbleAddCart ? (
              <Button
                block
                type="primary"
                loading={isAddToCartLoading}
                data-test-id="ordering.menu,product-detail-drawer.add-btn"
                onClick={() => {
                  dispatch(addToCart());
                }}
                className="tw-uppercase"
              >
                {t('AddToCart', { price: formattedTotalPrice })}
              </Button>
            ) : (
              <Button block type="primary" className="tw-uppercase" disabled>
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
