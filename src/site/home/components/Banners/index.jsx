import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Image from '../../../../components/Image';
import Slider from '../../../../common/components/Slider';
import CleverTap from '../../../../utils/clevertap';
import './index.scss';

class Banners extends Component {
  constructor(props) {
    super(props);
    this.state = { width: window.innerWidth };
  }
  updateWidth = () => {
    this.setState({ width: window.innerWidth });
  };
  componentDidMount() {
    window.addEventListener('resize', this.updateWidth);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWidth);
  }
  render() {
    const { collections } = this.props;

    if (!collections || collections.length === 0) {
      return null;
    }

    return (
      <div className="banner-container">
        <Slider
          mode="free-snap"
          perView={3}
          loop
          autoplay
          autoplayTime={2000}
          slideContainerStyle={{ width: this.state.width < 770 ? 'calc(252vw + 36px)' : '1086px' }}
        >
          {/* WB-4662: The reason why we triple collections when replacing swiper: We show 3 slides in a page, we must make total slides a multiple of 3. Or the calculation of keen-slider will encounter division and residual of non-integer, that suffers JS precision issue. This will lead the autoplay to a wrong direction at a certain moment. */}
          {([...collections, ...collections, ...collections] || []).map((collection, index) => {
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
