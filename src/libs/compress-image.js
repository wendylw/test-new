import config from "../config";

/* CONSTANTS variable */
// --BEGIN-- different from marketplace
const { imageS3Domain, imageCompressionDomain } = config;
window.storehub = window.storehub || { imageS3Domain, imageCompressionDomain };
// ---END--- different from marketplace

const IMAGE_RESIZE_METHODS = {
  COVER: 'cover',
  CONTAIN: 'contain',
  FILL: 'fill',
  INSIDE: 'inside',
  OUTSIDE: 'outside',
};
const IMAGE_DIMENSIONS = {
  STORE_LOGO: [
    { w: 300, h: 300 },
    { w: 160, h: 160 },
  ],
  PRODUCT: [
    {
      w: 800,
      h: 800,
    },
    {
      w: 500,
      h: 500,
    },
    {
      w: 300,
      h: 300,
    },
    {
      w: 100,
      h: 100,
    },
  ],
  BANNER: [
    { w: 1500, h: 420 },
    { w: 1100, h: 370 },
    { w: 900, h: 320 },
    { w: 600, h: 270 },
  ],
};

/**
* Sharp toFormat options has quality.
* toFormat doc url: https://sharp.dimens.io/en/stable/api-output/#toformat
* */
const IMAGE_QUALITY = [95, 85, 75, 65];
/*
* downlink [2.5, 1.5, 0.4, <0.4] MB/s
*/
const NETWORK_DOWNLINK = [2.5, 1.5, 0.4, 0];
/* end of CONSTANTS variable */
const testImg = typeof Image === 'undefined' ? { style: { 'object-position': 1 } } : new Image();
const supportsObjectFit = 'object-fit' in testImg.style;

/* CONSTANTS method */
function getImageDimension(dimensions, element) {
  if (!dimensions) {
    return {};
  }

  const index = Math.ceil(dimensions.length / 2);
  let dim = dimensions[index];

  if (!element) {
    return dim;
  }

  dimensions.some((item, key) => {
    const nextDim = dimensions[key <= dimensions.length - 2 ? key + 1 : key];
    const { w, h } = element;

    if ((w > nextDim.w && h > nextDim.h) && (w <= item.w && h <= item.h)) {
      dim = item;

      return true;
    }

    return false;
  });

  return dim;
}

/*
* downlink [2.5, 1.5, 0.4, <0.4] MB/s
*/
function getImageQuality() {
  /*
  * Get the device pixel ratio per our environment.
  * Default to 1.
  */
  const dpr = Math.round(window.devicePixelRatio || 1);
  let quality = IMAGE_QUALITY[1];

  NETWORK_DOWNLINK.some((item, index) => {
    const connection = navigator.connection
      || navigator.mozConnection
      || navigator.webkitConnection;
    const downlink = connection && connection.downlink ? connection.downlink : NETWORK_DOWNLINK[1];

    if (downlink >= item) {
      quality = IMAGE_QUALITY[
        (dpr < 2 && index !== IMAGE_QUALITY.length - 1) ? index + 1 : index
      ];

      return true;
    }

    return false;
  });

  return quality;
}

function isSettingURLValidHeight($el) {
  const imageURL = supportsObjectFit ? $el.querySelectorAll('img')[0].getAttribute('src') : getComputedStyle($el).getPropertyValue('background-image');
  const newImageURL = $el.getAttribute('data-src');

  return imageURL !== newImageURL;
}

const compressionImage = {
  fit: IMAGE_RESIZE_METHODS.INSIDE,
  init: (className) => {
    let objects = [];

    if (!className) {
      console.warn('image not exist');
      return;
    }

    if (typeof className === 'string') {
      objects = document.getElementsByClassName(className);
    } else {
      // 假装只有一个
      objects = [className];
    }

    compressionImage.setImageList(objects);
  },
  setImageList: ($objectFitList) => {
    if (!window || !$objectFitList) {
      return;
    }

    Array.prototype.forEach.call($objectFitList, ($el) => {
      const newImageURL = compressionImage.getImageURL($el);

      if (newImageURL && $el && isSettingURLValidHeight($el)) {
        compressionImage.setImageURL($el, newImageURL);
      }
      return null;
    });
  },
  setImageURL: ($el, url) => {
    /* eslint-disable no-param-reassign */
    $el.querySelectorAll('img')[0].src = url;
    $el.style.backgroundImage = `url(${url})`;
    /* eslint-enable no-param-reassign */

    return null;
  },
  showObjectImage: ($el) => {
    if (supportsObjectFit) {
      $el.querySelectorAll('img')[0].style.display = 'block';
    }
  },
  getImageURL: ($el) => {
    const imageURL = $el.getAttribute('data-src');

    // TODO: settings should be refactored
    const {
      imageS3Domain = '',
      imageCompressionDomain,
    } = window.storehub || {};

    if (!imageURL) {
      return null;
    }

    const lastIndex = imageURL.lastIndexOf('/');
    const imageType = $el.getAttribute('data-type') || 'PRODUCT';
    const dim = getImageDimension(
      IMAGE_DIMENSIONS[imageType],
      {
        w: $el.offsetWidth,
        h: $el.offsetHeight,
      },
    );
    const fit = imageType === 'PRODUCT' ? IMAGE_RESIZE_METHODS.OUTSIDE : compressionImage.fit;
    let path = imageURL.substring(0, lastIndex);

    if (imageCompressionDomain) {
      path = path.replace(imageS3Domain, imageCompressionDomain);
    }

    const imageObject = {
      path,
      dim: `${dim.w}x${dim.h}`,
      quality: getImageQuality(),
      fit,
      name: imageURL.substring(lastIndex + 1, imageURL.length),
    };

    return Object.values(imageObject).join('/');
  },
};

export default compressionImage;
