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
      <div>
        <Slider loop spacing={12} autoplay autoplayTime={2000}>
          {(collections || []).map((collection, index) => {
            const { image, beepCollectionId, urlPath, name } = collection;
            return (
              <div
                key={beepCollectionId}
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
