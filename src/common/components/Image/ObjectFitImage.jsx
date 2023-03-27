import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import _isNil from 'lodash/isNil';
import Image, { AVAILABLE_DIMENSIONS } from './Image';
import Loader from '../Loader';
import styles from './ObjectFitImage.module.scss';

const LOADED_IMAGE_SET = new Set();

const computeDimensionStyle = (width, height, aspectRatio) => {
  const computedWidth = _isNil(width) ? '100%' : width;
  const computedHeight = _isNil(height) ? undefined : height;
  // if height and aspectRatio are provide at the same time, aspectRatio will be ignored
  const placeholderHeight = _isNil(computedHeight) ? `${(aspectRatio || 1) * 100}%` : undefined;
  return {
    width: computedWidth,
    height: computedHeight,
    placeholderHeight,
  };
};

const ObjectFitImage = props => {
  const {
    className,
    style,
    alt,
    src,
    dimension,
    showLoader,
    noCompression,
    width,
    height,
    aspectRatio,
    loading,
  } = props;
  const [imageLoaded, setImageLoaded] = useState(LOADED_IMAGE_SET.has(src));
  const onImageLoad = useCallback(() => {
    setImageLoaded(true);
    LOADED_IMAGE_SET.add(src);
  }, [setImageLoaded, src]);

  const { placeholderHeight, ...figureDimension } = computeDimensionStyle(width, height, aspectRatio);

  if (!src) {
    return null;
  }

  return (
    <figure className={`${styles.imageFigure} ${className}`} style={{ ...figureDimension, ...style }}>
      {!_isNil(placeholderHeight) ? (
        <div className="tw-pointer-events-none" style={{ paddingTop: placeholderHeight }} />
      ) : null}
      <Image
        className={`${styles.image} ${imageLoaded ? '' : 'tw-opacity-0'}`}
        src={src}
        alt={alt}
        dimension={dimension}
        noCompression={noCompression}
        onLoad={onImageLoad}
        loading={loading}
      />

      {!imageLoaded && showLoader && <Loader className={styles.imageFigureLoader} weight="bold" />}
    </figure>
  );
};

ObjectFitImage.displayName = 'ObjectFitImage';
ObjectFitImage.propTypes = {
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  alt: PropTypes.string,
  src: PropTypes.string,
  dimension: PropTypes.oneOf(Array.from(AVAILABLE_DIMENSIONS)),
  showLoader: PropTypes.bool,
  // If static source is not provided, the image will not be loaded from the server
  noCompression: PropTypes.bool,
  // if height and aspectRatio are provide at the same time, aspectRatio will be ignored
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  aspectRatio: PropTypes.number,
  loading: PropTypes.string,
};
ObjectFitImage.defaultProps = {
  className: '',
  style: {},
  alt: '',
  src: '',
  dimension: '160x160',
  showLoader: true,
  noCompression: false,
  width: '100%',
  height: undefined,
  aspectRatio: 1,
  loading: 'eager',
};
export default ObjectFitImage;
