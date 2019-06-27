const Utils = {};

Utils.debounce = function debounce(fn, timeout = 50) {
  let timer = null;
  return function newFn(...args) {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => fn.apply(fn, args), timeout);
  };
};

Utils.elementPartialOffsetTop = function elementPartialOffsetTop(el, topAdjustment = 0) {
  var top = el.offsetTop;
  var height = el.offsetHeight;

  while (el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
  }

  return (top + height) - window.pageYOffset - topAdjustment;
}

Utils.getFormatPhoneNumber = function getFormatPhoneNumber(phone, countryCode) {
  let currentPhone = (phone || '').substring(3);

  if (countryCode && !currentPhone.indexOf(countryCode)) {
    phone = '+' + countryCode + currentPhone.substring(countryCode.length);
  }

  return phone;
}

export default Utils;
