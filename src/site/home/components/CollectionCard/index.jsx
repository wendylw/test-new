import React from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import './index.scss';
import { compose } from 'redux';
import Image from '../../../../components/Image';
import CleverTap from '../../../../utils/clevertap';

class CollectionCard extends React.Component {
  render() {
    const { collections, backLeftPosition } = this.props;

    return (
      <ul className="store-collections flex flex-space-between flex-middle">
        {collections.map((collection, index) => {
          const { name, image, urlPath, beepCollectionId } = collection;
          return (
            <li
              key={urlPath}
              className="store-collections__item text-center"
              data-testid="collection"
              data-heap-name="site.home.collection-icon"
              data-heap-collection-name={name}
              onClick={() => {
                CleverTap.pushEvent('Homepage - Click Collection Icon', {
                  'collection name': name,
                  'collection id': beepCollectionId,
                  rank: index + 1,
                });
                // concern to use location.href if icons fixed to the top
                backLeftPosition();
                this.props.history.push({
                  pathname: `/collections/${urlPath}`,
                });
              }}
            >
              <Image src={image} alt={name} className="icon store-collections__img" />
              <span className="store-collections__name text-size-smaller text-center text-weight-bolder">{name}</span>
            </li>
          );
        })}
      </ul>
    );
  }
}

export default compose(withTranslation(['SiteHome']), withRouter)(CollectionCard);
