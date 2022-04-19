import React from 'react';
import { ObjectFitImage } from '../../../../../common/components/Image';
import FoodCourtLogo from '../../../../../images/food-court-temp/food-court-logo.jpeg';
import styles from './FoodCourtInfo.module.scss';

const FoodCourtInfo = () => (
  <div className="tw-flex tw-items-center tw-justify-center tw-px-16 sm:tw-px-16px tw-my-16 sm:tw-my-16px">
    <div className={styles.foodCourtInfoLogo}>
      <ObjectFitImage className="tw-rounded" src={FoodCourtLogo} staticSource />
    </div>
    <div className={`${styles.foodCourtInfoContent} beep-line-clamp-flex-container`}>
      <h1 className={styles.foodCourtInfoTitle}>REXKL</h1>
      <p className={styles.foodCourtInfoCity}>Kuala Lumpur</p>
    </div>
  </div>
);

FoodCourtInfo.displayName = 'FoodCourtInfo';

export default FoodCourtInfo;
