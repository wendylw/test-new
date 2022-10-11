import { SOURCE_TYPE } from '../../../common/utils/constants';

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
    console.error(`Failed to get share link: ${error.message}`);

    return window.location.href;
  }
};
