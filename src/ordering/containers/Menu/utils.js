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

// eslint-disable-next-line consistent-return
export const getIsIosMobile = () => {
  const set = new Set();
  const temp = /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent);
  set.add(temp);
  if (set.has(temp)) {
    return temp;
  }
};
