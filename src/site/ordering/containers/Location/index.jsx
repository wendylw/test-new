import React from 'react';
import LocationPicker, { setHistoricalDeliveryAddresses } from '../../../../components/LocationPicker';

const LocationWrapper = props => {
  const onSelect = positionInfo => {
    // todo: replace the content onSelect with real logic
    console.log(positionInfo);
    setHistoricalDeliveryAddresses(positionInfo);
  };
  return <LocationPicker mode="ORIGIN_DEVICE" onSelect={onSelect} />;
};

export default LocationWrapper;
