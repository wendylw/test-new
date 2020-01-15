import React from 'react';
import PropTypes from 'prop-types';
import config from '../config';

/* CONSTANTS variable */
// --BEGIN-- different from marketplace
const PLACEHOLDER = '/img/product-placeholder.jpg';
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
const DIM = {
  w: 100,
  h: 100,
};
const DIM_SCALING_RATIO = [1, 5, 8];
const FIT = 'outside';
class Image extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.src !== this.props.src;
  }

  /*
   * downlink [2.5, 1.5, 0.4, <0.4] MB/s
   */
  getImageQuality() {
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

  getImageURL() {
    const { scalingRatioIndex, src: imageURL } = this.props;

    if (!Boolean(imageURL)) {
      return null;
    }

    const lastIndex = imageURL.lastIndexOf('/');
    let path = imageURL.substring(0, lastIndex);

    if (imageCompressionDomain) {
      path = path.replace(imageS3Domain, imageCompressionDomain);
    }

    const imageObject = {
      path,
      dim: `${DIM.w * DIM_SCALING_RATIO[scalingRatioIndex]}x${DIM.h * DIM_SCALING_RATIO[scalingRatioIndex]}`,
      quality: this.getImageQuality(),
      fit: FIT,
      name: imageURL.substring(lastIndex + 1, imageURL.length),
    };

    return Object.values(imageObject).join('/');
  }

  render() {
    const { className, alt } = this.props;

    return (
      <figure className={className}>
        <img src={this.getImageURL() || PLACEHOLDER} alt={alt} />;
      </figure>
    );
  }
}

Image.propTypes = {
  className: PropTypes.string,
  alt: PropTypes.string,
  src: PropTypes.string,
  scalingRatioIndex: PropTypes.number,
};

Image.defaultProps = {
  className: '',
  alt: '',
  scalingRatioIndex: 0,
};

export default Image;
