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

Utils.elementPartialOffsetTop = function elementPartialOffsetTop(el) {
  var top = el.offsetTop;
  var height = el.offsetHeight;

  while(el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
  }

  return (top + height) - window.pageYOffset;
}

export default Utils;
