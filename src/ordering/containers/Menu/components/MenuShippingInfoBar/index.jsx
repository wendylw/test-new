import React from 'react';
import { useSelector } from 'react-redux';
import MenuAddressDropdown from './MenuAddressDropdown';
import { getIsQrOrderingShippingType } from '../../redux/common/selectors';
import styles from './MenuShippingInfoBar.module.scss';
import TimeSlotDropdown from './TimeSlotDropdown';

const MenuShippingInfoBar = () => {
  const isQrOrderingShippingType = useSelector(getIsQrOrderingShippingType);

  if (isQrOrderingShippingType) {
    return null;
  }

  return (
    <div className={styles.menuShippingInfoBar}>
      <MenuAddressDropdown />
      <TimeSlotDropdown />
    </div>
  );
};

MenuShippingInfoBar.displayName = 'MenuShippingInfoBar';

export default MenuShippingInfoBar;
