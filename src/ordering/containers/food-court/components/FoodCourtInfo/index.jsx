import React from 'react';
import { ObjectFitImage } from '../../../../../common/components/Image';
import FoodCourtLogo from '../../../../../images/food-court-temp/food-court-logo.jpeg';
import FoodDistrictLogo from '../../../../../images/food-court-temp/food-district-logo.png';
import styles from './FoodCourtInfo.module.scss';

const OWNERS_MAPPING = {
  fooddistrict: {
    name: 'Food District',
    logo: FoodDistrictLogo,
    location: 'One Utama',
  },
  thebackground: {
    name: 'REXKL',
    logo: FoodCourtLogo,
    location: 'Kuala Lumpur',
  },
};

const FoodCourtInfo = () => {
  const hostName = window.location.hostname.split('.')[0] || '';
  const owner = OWNERS_MAPPING[hostName] || OWNERS_MAPPING.thebackground;

  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-px-16 sm:tw-px-16px tw-my-16 sm:tw-my-16px">
      <div className={styles.foodCourtInfoLogo}>
        <ObjectFitImage className="tw-rounded" src={owner.logo} noCompression />
      </div>
      <div className={`${styles.foodCourtInfoContent} beep-line-clamp-flex-container`}>
        <h1 className={styles.foodCourtInfoTitle}>{owner.name}</h1>
        <p className={styles.foodCourtInfoCity}>{owner.location}</p>
      </div>
    </div>
  );
};

FoodCourtInfo.displayName = 'FoodCourtInfo';

export default FoodCourtInfo;
