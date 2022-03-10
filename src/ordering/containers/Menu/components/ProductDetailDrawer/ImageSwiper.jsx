import React from 'react';
import PropTypes from 'prop-types';
import SwiperCore, { Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ObjectFitImage } from '../../../../../common/components/Image';
import 'swiper/swiper.scss';
import 'swiper/components/pagination/pagination.scss';

SwiperCore.use([Pagination]);

const ImageSwiper = props => {
  const { images = [] } = props;
  return (
    <div>
      {images.length > 1 ? (
        <Swiper
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet',
          }}
        >
          {images.map(image => (
            <SwiperSlide key={image}>
              <ObjectFitImage src={image} dimension="500x500" width="100%" height="30vh" />
            </SwiperSlide>
          ))}
        </Swiper>
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
