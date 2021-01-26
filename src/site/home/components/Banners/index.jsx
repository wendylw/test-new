import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import SwiperCore, { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from '../../../../components/Image';
import * as CleverTap from '../../../../utils/clevertap';
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
          spaceBetween={12}
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
                  // CleverTap.pushEvent('Homepage - Click Collection Banner', {
                  //   'collection name': name,
                  //   'rank': index + 1,
                  // });
                  this.props.history.push({
                    pathname: `/collections/${urlPath}`,
                  });
                }}
                data-heap-name="site.home.collection-banners"
                className="banners-item"
              >
                <Image src={image} alt={name} scalingRatioIndex={2} />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    );
  }
}

export default withRouter(Banners);
