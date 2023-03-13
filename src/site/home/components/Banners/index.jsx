import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Image from '../../../../components/Image';
import Slider from '../../../../common/components/Slider';
import CleverTap from '../../../../utils/clevertap';
import './index.scss';

class Banners extends Component {
  render() {
    const { collections } = this.props;

    if (!collections || collections.length === 0) {
      return null;
    }

    return (
      <div className="banner-container">
        <Slider
          mode="free-snap"
          perView={2}
          loop
          autoplay
          autoplayTime={2000}
          slideContainerStyle={{ width: window.innerWidth < 770 ? '180vw' : '744px' }}
        >
          {([...collections, ...collections] || []).map((collection, index) => {
            const { image, beepCollectionId, urlPath, name } = collection;
            return (
              <div
                key={beepCollectionId + index}
                onClick={() => {
                  CleverTap.pushEvent('Homepage - Click Collection Banner', {
                    'collection name': name,
                    'collection id': beepCollectionId,
                    rank: index + 1,
                  });
                  this.props.history.push({
                    pathname: `/collections/${urlPath}`,
                  });
                }}
                data-heap-name="site.home.collection-banners"
                className="banners-item tw-cursor-pointer"
              >
                <Image src={image} alt={name} scalingRatioIndex={2} />
              </div>
            );
          })}
        </Slider>
      </div>
    );
  }
}
Banners.displayName = 'SiteBanners';

export default withRouter(Banners);
