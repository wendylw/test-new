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

Utils.isProductSoldOut = (product) => {
  const { markedSoldOut, variations } = product;

  if (markedSoldOut) {
    return true;
  }

  if (Array.isArray(variations) && variations.length > 0) {
    let soldOut = false;

    const firstVariation = variations[0];

    if (firstVariation && firstVariation.variationType === 'SingleChoice') {
      const soldOutOptions = firstVariation.optionValues.filter(optionValue => {
        return optionValue.markedSoldOut;
      });

      if (soldOutOptions.length === firstVariation.optionValues.length) {
        soldOut = true;
      }
    }

    return soldOut;
  }

  return false;
}

export default Utils;
