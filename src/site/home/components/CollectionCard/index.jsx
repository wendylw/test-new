import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import styles from './index.module.scss';
import Image from '../../../../components/Image';
import CleverTap from '../../../../utils/clevertap';

const CollectionCard = ({ history, collections, backLeftPosition }) => (
  <ul className={styles.IconCollectionWrapper}>
    {collections.map((collection, index) => {
      const { name, image, urlPath, beepCollectionId } = collection;
      return (
        <li
          key={urlPath}
          className={styles.IconCollectionContainer}
          data-test-id="site.home.collection-icon"
          onClick={() => {
            CleverTap.pushEvent('Homepage - Click Collection Icon', {
              'collection name': name,
              'collection id': beepCollectionId,
              rank: index + 1,
            });
            // concern to use location.href if icons fixed to the top
            backLeftPosition();
            history.push({
              pathname: `/collections/${urlPath}`,
            });
          }}
        >
          <Image src={image} alt={name} className={styles.IconCollectionFigure} />
          <span className={styles.IconCollectionTitle}>{name}</span>
        </li>
      );
    })}
  </ul>
);

CollectionCard.displayName = 'CollectionCard';

CollectionCard.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  collections: PropTypes.array,
  backLeftPosition: PropTypes.func,
};

CollectionCard.defaultProps = {
  collections: [],
  backLeftPosition: () => {},
};

export default compose(withTranslation(['SiteHome']), withRouter)(CollectionCard);
