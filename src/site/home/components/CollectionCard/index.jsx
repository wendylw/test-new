import React from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import './index.scss';
import { compose } from 'redux';
import Image from '../../../../components/Image';

class CollectionCard extends React.Component {
  render() {
    const { collections, backLeftPosition } = this.props;

    return (
      <ul className="store-collections flex flex-space-between flex-middle">
        {collections.map(collection => {
          const { name, image, urlPath } = collection;
          return (
            <li
              key={urlPath}
              className="store-collections__item text-center"
              data-testid="collection"
              onClick={() => {
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
