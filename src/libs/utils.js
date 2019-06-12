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

Utils.DateFormatter = function DateFormatter(dateString, deletedDelimiter) {
	if (!dateString) {
		return '';
	}

	const datePattern = ['m', 'y'];
	const blocks = [2, 2];
	let date = dateString.replace(/[^\d]/g, '');
	const dateArray = [];

	if (!date.length) {
		return '';
	}

	// Split the card number is groups of Block
	blocks.forEach(block => {
		if (date.substring(0, block) && date.substring(0, block).length) {
			dateArray.push(date.substring(0, block));
			date = date.substring(block);
		}
	});

	datePattern.forEach((pattern, index) => {
		if (pattern === 'm') {
			if (dateArray[index] === '00') {
				dateArray[index] = '01';
			} else if (parseInt(dateArray[index].slice(0, 1), 10) > 1) {
				dateArray[index] = '0' + dateArray[index].slice(0, 1);
			} else if (parseInt(dateArray[index], 10) > 12) {
				dateArray[index] = '12';
			}
		} else if (pattern === 'y') {
			if (parseInt(dateArray[index], 10) < 0){
				dateArray[index] = '00';
			} else if (parseInt(dateArray[index], 10) > 99) {
				dateArray[index] = '99';
			}
		}

		if (index !== datePattern.length - 1) {
			dateArray[index] = (dateArray[index].length === blocks[index] && !deletedDelimiter) ? `${dateArray[index]} / ` : dateArray[index][0];
		}
	});

	return dateArray.join('');
}

Utils.creditCardDetector = function creditCardDetector(cardNumberString) {
	if (!cardNumberString) {
		return '';
	}

	const defaultBlock = [4, 4, 4, 4];
	const blocks = {
		mastercard: defaultBlock,
		visa: defaultBlock,
	};
	const re = {
		// starts with 51-55/2221–2720; 16 digits
		mastercard: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/,
		// starts with 4; 16 digits
		visa: /^4\d{0,15}/,
	};
	const card = {};
	const cardNumberSections = [];
	let cardNumber = cardNumberString.replace(/[^\d]/g, '').substring(0, 16);

	Object.assign(card, {
		type: Object.keys(re).find(key => re[key].test(cardNumber)) || ''
	});

	// Split the card number is groups of Block
	const usingBlocks = (blocks[card.type] || defaultBlock);

	usingBlocks.forEach((block, index) => {
		if (cardNumber.substring(0, block) && cardNumber.substring(0, block).length) {
			const delimiter = (cardNumber.substring(0, block).length === block && index !== usingBlocks.length - 1) ? ' ' : '';

			cardNumberSections.push(cardNumber.substring(0, block) + delimiter);
			cardNumber = cardNumber.substring(block);
		}
	});


	if (cardNumberSections !== null) {
		Object.assign(card, {
			formattedCardNumber: cardNumberSections.join(''),
		});
	}

	return card;
}

export default Utils;
