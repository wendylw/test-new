import { SOURCE_TYPE, PRODUCT_STOCK_STATUS } from '../../../common/utils/constants';
import { PRODUCT_VARIATION_TYPE } from './constants';
import logger from '../../../utils/monitoring/logger';

export const bodyScrollTopPosition = () =>
  document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;

export const getSearchingBannerHeight = stickySearchingBoxEl =>
  stickySearchingBoxEl ? stickySearchingBoxEl.clientHeight || stickySearchingBoxEl.offsetHeight : 0;

export const getSearchingBannerOffsetTop = stickySearchingBoxEl =>
  stickySearchingBoxEl ? stickySearchingBoxEl.offsetTop : 0;

export const getProductListOffsetTop = productListEl => (productListEl ? productListEl.offsetTop : 0);

export const getWindowScrollingPositionForSearchingProductList = ({
  scrollTopPosition: bodyScrollingPosition,
  productListOffsetTop,
  searchingBannerHeight,
  searchingBannerOffsetTop,
}) => {
  // If searchingBannerOffsetTop > bodyScrollingPosition that search banner hasn't sticky on top. only hide elements above search banner
  if (searchingBannerOffsetTop > bodyScrollingPosition) {
    return 0;
  }

  // Search banner has sticky on top.
  // Window scrolling keep on current product list position, position reduce elements height above search banner
  return bodyScrollingPosition - (productListOffsetTop - searchingBannerHeight);
};

export const getWindowInnerHeight = () => window.innerHeight;

export const getIsVirtualKeyboardVisibleInMobile = (isMobile, isVirtualKeyboardVisible) =>
  isMobile && isVirtualKeyboardVisible;

export const getShareLinkUrl = () => {
  try {
    const storeUrl = new URL(window.location.href);
    const { searchParams } = storeUrl;

    searchParams.set('source', SOURCE_TYPE.SHARED_LINK);
    searchParams.set('utm_source', 'store_link');
    searchParams.set('utm_medium', 'share');

    return storeUrl.toString();
  } catch (error) {
    logger.error('Ordering_Menu_getShareLinkUrlFailed', { message: error?.message || '' });

    return window.location.href;
  }
};

// WB-4385: This function is used to check if the variation option is available or not.
// NOTE: The result is only based on the stock status now.
export const isVariationOptionAvailable = ({
  variationType,
  variationShareModifier,
  optionValue,
  optionMarkedSoldOut,
  productChildrenMap,
}) => {
  if (optionMarkedSoldOut) {
    return false;
  }

  if (variationType !== PRODUCT_VARIATION_TYPE.SINGLE_CHOICE) {
    return true;
  }

  // If variation's isModifier is true, that means it is not Track Inventory, return true.
  if (variationShareModifier) {
    return true;
  }

  // If product has no children, that means it is not Track Inventory, return true.
  if (productChildrenMap.length === 0) {
    return true;
  }

  return !productChildrenMap
    .filter(({ variation }) => variation.includes(optionValue))
    .every(({ stockStatus }) => stockStatus === PRODUCT_STOCK_STATUS.OUT_OF_STOCK);
};
