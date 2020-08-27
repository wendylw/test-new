import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import SwiperCore, { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from '../../../../components/Image';
import 'swiper/swiper.scss';
import './index.scss';

SwiperCore.use([Autoplay]);

class Banners extends Component {
  render() {
    const { collections } = this.props;

    if (!collections || collections.length === 0) {
      return null;
    }

    return (
      <div>
        <Swiper
          className="margin-top-bottom-smaller"
          slidesPerView={'auto'}
          spaceBetween={10}
          loop={true}
          centeredSlides={true}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
        >
          {(collections || []).map((collection, index) => {
            const { image, beepCollectionId, urlPath, name } = collection;
            return (
              <SwiperSlide
                key={beepCollectionId}
                onClick={() => {
                  this.props.history.push({
                    pathname: `/collections/${urlPath}`,
                  });
                }}
                className="banners-item"
              >
                <Image src={image} alt={name} />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    );
  }
}

export default withRouter(Banners);
