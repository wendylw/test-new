import React from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import IconPickup from './images/Beepcateg-pickup.svg';
import IconHalal from './images/Beepcateg-halal.svg';
import IconDessert from './images/Beepcateg-dessert.svg';
import IconWestern from './images/Beepcateg-western.svg';
import './index.scss';
import { compose } from 'redux';

const icons = {
  IconPickup: IconPickup,
  IconHalal: IconHalal,
  IconDessert: IconDessert,
  IconWestern: IconWestern,
};

class CollectionCard extends React.Component {
  render() {
    const { t, collections, backLeftPosition } = this.props;

    return (
      <ul className="flex flex-space-between flex-middle padding-top-bottom-normal">
        {collections.map(collection => (
          <li
            key={collection.label}
            className="store-collections__item text-center"
            onClick={() => {
              // concern to use location.href if icons fixed to the top
              backLeftPosition();
              this.props.history.push({
                pathname: `/collections/${collection.slug}`,
              });
            }}
          >
            <img src={icons[collection.icon]} alt={t(collection.label)} className="icon" />
            <span className="store-collections__name text-size-smaller text-center text-weight-bolder">
              {t(collection.label)}
            </span>
          </li>
        ))}
      </ul>
    );
  }
}

export default compose(withTranslation(['SiteHome']), withRouter)(CollectionCard);
