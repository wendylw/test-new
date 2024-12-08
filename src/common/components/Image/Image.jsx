/**
 * Image
 */

import React from 'react';
import PropTypes from 'prop-types';
import config from '../../../config';
import logger from '../../../utils/monitoring/logger';

/* CONSTANTS variable */
// --BEGIN-- different from marketplace
const { imageS3Domain, imageCompressionDomain } = config;
window.storehub = window.storehub || { imageS3Domain, imageCompressionDomain };
// ---END--- different from marketplace
/**
 * Sharp toFormat options has quality.
 * toFormat doc url: https://sharp.dimens.io/en/stable/api-output/#toformat
 * */
const IMAGE_QUALITY = [95, 85, 75, 65];
/*
 * downlink [2.5, 1.5, 0.4, <0.4] MB/s
 */
const NETWORK_DOWNLINK = [2.5, 1.5, 0.4, 0];
export const AVAILABLE_DIMENSIONS = new Set(['100x100', '160x160', '500x500', '800x800']);
const FIT = 'outside';

function getImageQuality() {
  /*
   * Get the device pixel ratio per our environment.
   * Default to 1.
   */
  const dpr = Math.round(window.devicePixelRatio || 1);
  let quality = IMAGE_QUALITY[1];

  NETWORK_DOWNLINK.some((item, index) => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const downlink = connection && connection.downlink ? connection.downlink : NETWORK_DOWNLINK[1];

    if (downlink >= item) {
      quality = IMAGE_QUALITY[dpr < 2 && index !== IMAGE_QUALITY.length - 1 ? index + 1 : index];

      return true;
    }

    return false;
  });

  return quality;
}

function getImageURL(dimension, imageURL) {
  if (!imageURL) {
    return null;
  }

  const lastIndex = imageURL.lastIndexOf('/');
  let path = imageURL.substring(0, lastIndex);

  if (imageCompressionDomain) {
    path = path.replace(imageS3Domain, imageCompressionDomain);
  }
  let effectiveDimension = dimension;
  if (!AVAILABLE_DIMENSIONS.has(dimension)) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Image dimension (${dimension}) is not supported`);
    } else {
      logger.error('Common_Image_DimensionIsNotSupported', { dimension });
    }
    effectiveDimension = '500x500';
  }

  const imageObject = {
    path,
    dim: effectiveDimension,
    quality: getImageQuality(),
    fit: FIT,
    name: imageURL.substring(lastIndex + 1, imageURL.length),
  };

  return Object.values(imageObject).join('/');
}

const Image = ({ className, style, src, alt, dimension, noCompression, onLoad, onError, loading }) => {
  if (!src) {
    return null;
  }

  return (
    <img
      className={className}
      src={noCompression ? src : getImageURL(dimension, src)}
      alt={alt}
      onLoad={onLoad}
      onError={onError}
      style={style}
      loading={loading}
    />
  );
};

Image.displayName = 'Image';
Image.propTypes = {
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  alt: PropTypes.string,
  src: PropTypes.string,
  dimension: PropTypes.oneOf(Array.from(AVAILABLE_DIMENSIONS)),
  // If static source is not provided, the image will not be loaded from the server
  noCompression: PropTypes.bool,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  loading: PropTypes.string,
};
Image.defaultProps = {
  className: '',
  style: {},
  alt: '',
  src: '',
  dimension: '160x160',
  noCompression: false,
  onLoad: () => {},
  onError: () => {},
  loading: 'eager',
};

export default Image;
