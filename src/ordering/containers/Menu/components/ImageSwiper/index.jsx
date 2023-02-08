import React from 'react';
import PropTypes from 'prop-types';
import { ObjectFitImage } from '../../../../../common/components/Image';
import styles from './ImageSwiper.module.scss';
import Slider from '../../../../components/Slider';

const ImageSwiper = props => {
  const { images = [] } = props;
  return (
    <div>
      {images.length > 1 ? (
        <Slider showPagination>
          {images.map(image => (
            <div key={image} className={styles.SliderItemContainer}>
              <ObjectFitImage src={image} dimension="500x500" width="100%" height="30vh" />
            </div>
          ))}
        </Slider>
      ) : images.length === 1 ? (
        <ObjectFitImage src={images[0]} dimension="500x500" width="100%" height="30vh" />
      ) : null}
    </div>
  );
};

ImageSwiper.displayName = 'ImageSwiper';

ImageSwiper.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
};
ImageSwiper.defaultProps = {
  images: [],
};

export default ImageSwiper;
