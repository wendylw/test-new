// WB-6015: Don't modify this code lightly, but delete it if you have a chance, because it was added because of the special UI of Boss
export const getWebQRImageHeight = () => {
  const windowInnerHeight = window.innerHeight;
  const headerHeight = document.querySelector('.header')?.clientHeight || 0;
  const imageElement = document.querySelector('.page-login__image-container') || null;
  const imageMargin = imageElement ? window.parseFloat(window.getComputedStyle(imageElement, null).marginTop) : 0;
  const phoneViewContainer = document.querySelector('.phone-view') || null;
  const phoneViewContainerHeight = phoneViewContainer?.clientHeight || 0;
  const phoneViewContainerPadding = phoneViewContainer
    ? window.parseFloat(window.getComputedStyle(phoneViewContainer, null).paddingTop)
    : 0;
  const phoneViewContainerMargin = phoneViewContainer
    ? window.parseFloat(window.getComputedStyle(phoneViewContainer, null).marginTop)
    : 0;
  const loginAsGuestButton = document.querySelector('.page-login__login-as-guest-button') || null;
  const loginAsGuestButtonHeight = loginAsGuestButton?.clientHeight || 0;
  const loginAsGuestButtonMargin = loginAsGuestButton
    ? window.parseFloat(window.getComputedStyle(loginAsGuestButton, null).marginTop) +
      window.parseFloat(window.getComputedStyle(loginAsGuestButton, null).marginBottom)
    : 0;
  const termTextHalfHeight = 17 / 2;

  // calculate image height for term text to be centered of page bottom line
  const imageHeight =
    windowInnerHeight -
    headerHeight -
    imageMargin -
    phoneViewContainerMargin -
    (phoneViewContainerHeight -
      phoneViewContainerPadding -
      loginAsGuestButtonHeight -
      loginAsGuestButtonMargin -
      termTextHalfHeight);

  return imageHeight;
};
