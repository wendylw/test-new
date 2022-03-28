import React from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import styles from './index.module.scss';
import { compose } from 'redux';
import Image from '../../../../components/Image';
import CleverTap from '../../../../utils/clevertap';

class CollectionCard extends React.Component {
  render() {
    const { collections, backLeftPosition } = this.props;

    return (
      <ul className={styles.IconCollection__wrapper}>
        {collections.map((collection, index) => {
          const { name, image, urlPath, beepCollectionId } = collection;
          return (
            <li
              key={urlPath}
              className={styles.IconCollection__container}
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
              <Image src={image} alt={name} className={styles.IconCollection__figure} />
              <span className={styles.IconCollection__title}>{name}</span>
            </li>
          );
        })}
      </ul>
    );
  }
}
CollectionCard.displayName = 'CollectionCard';

export default compose(withTranslation(['SiteHome']), withRouter)(CollectionCard);
