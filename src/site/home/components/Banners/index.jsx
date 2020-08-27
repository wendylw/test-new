import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Swipe, { SwipeItem } from 'swipejs/react';
import Image from '../../../../components/Image';
import './index.scss';

class Banners extends Component {
  render() {
    const { collections } = this.props;

    if (!collections || collections.length === 0) {
      return null;
    }

    return (
      <div>
        <Swipe
          className="banners-container margin-top-bottom-smaller"
          ref="swipe"
          startSlide={0}
          auto={2000}
          continuous={true}
          autoRestart={true}
        >
          {(collections || []).map((collection, index) => {
            const { image, beepCollectionId, urlPath, name } = collection;
            return (
              <SwipeItem
                key={beepCollectionId}
                onClick={() => {
                  this.props.history.push({
                    pathname: `/collections/${urlPath}`,
                  });
                }}
                className="banners-item padding-left-right-normal"
              >
                <Image src={image} alt={name} />
              </SwipeItem>
            );
          })}
        </Swipe>
      </div>
    );
  }
}

export default withRouter(Banners);
