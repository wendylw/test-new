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

  while(el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
  }

  return (top + height) - window.pageYOffset - topAdjustment;
}

Utils.getPhoneNumber = function getPhoneNumber() {
  return localStorage.getItem('user.p');
}

Utils.setPhoneNumber = function setPhoneNumber(phone) {
  localStorage.setItem('user.p', phone);
}

export default Utils;
