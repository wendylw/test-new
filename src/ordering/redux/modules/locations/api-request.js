import { get, post } from '../../../../utils/api/api-fetch';

export const getLocationHistoryList = () => get('/api/storage/location-history');

export const putLocationToHistoryList = async positionInfo => {
  const clonedPositionInfo = { ...positionInfo };
  // won't save distance, because use may choose another store.
  delete clonedPositionInfo.distance;
  const result = await post('/api/storage/location-history', clonedPositionInfo);

  return result;
};
