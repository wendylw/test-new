import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Tag from '../../../common/components/Tag';
import { LocationAndAddressIcon } from '../../../common/components/Icons';
import styles from './LocationList.module.scss';

const LocationList = ({ isLocationListVisible, locationList, onSelectLocation }) => {
  const { t } = useTranslation();

  if (!isLocationListVisible) {
    return null;
  }

  return (
    <ul>
      {locationList.map(({ placeId, displayComponents, outOfRange }) => (
        <li key={placeId} className={styles.locationItem}>
          <button className={styles.locationItemButton} onClick={onSelectLocation}>
            <LocationAndAddressIcon className="tw-flex-shrink-0 tw-my-4 sm:tw-my-4px" />
            <div className="beep-line-clamp-flex-container tw-flex-col">
              <h4 className="tw-flex tw-items-center tw-justify-start tw-my-2 sm:tw-my-2px">
                <span className={styles.locationItemButtonTitle}>{displayComponents.mainText}</span>
              </h4>
              <p className={styles.locationItemButtonDeliveryTo}>{displayComponents.secondaryText}</p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
};

LocationList.displayName = 'LocationList';

LocationList.propTypes = {
  isLocationListVisible: PropTypes.bool,
  locationList: PropTypes.arrayOf(PropTypes.object),
  onSelectLocation: PropTypes.func,
};

LocationList.defaultProps = {
  isLocationListVisible: false,
  locationList: [],
  onSelectLocation: () => {},
};

export default LocationList;
