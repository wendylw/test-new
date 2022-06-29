import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsFulfillMinimumConsumption } from './redux/cart/selectors';
import {
  getSelectedDateDisplayValue,
  getSelectedLocationDisplayName,
  getStoreId,
  getShippingType,
  getSelectedTimeDisplayValue,
  getStoreStatus,
  getDisplayDeliveryDistance,
  getFormattedShippingFee,
  getIsAddressOutOfRange,
  getIsAbleToReviewCart,
  getStoreRatingDisplayValue,
  getIsFreeDeliveryTagVisible,
  getFreeShippingFormattedMinAmount,
  getFreeShippingFormattedMinAmountWithOutSpacing,
} from './redux/common/selectors';

function Debug() {
  const locationDisplayName = useSelector(getSelectedLocationDisplayName);
  const storeId = useSelector(getStoreId);
  const shippingType = useSelector(getShippingType);
  const selectedDateDisplayValue = useSelector(getSelectedDateDisplayValue);
  const selectedTimeDisplayValue = useSelector(getSelectedTimeDisplayValue);
  const storeStatus = useSelector(getStoreStatus);
  const deliveryDistance = useSelector(getDisplayDeliveryDistance);
  const formattedShippingFee = useSelector(getFormattedShippingFee);
  const isAddressOutOfRange = useSelector(getIsAddressOutOfRange);
  const isAbleToReviewCart = useSelector(getIsAbleToReviewCart);
  const isFulfillMinimumConsumption = useSelector(getIsFulfillMinimumConsumption);
  const storeRating = useSelector(getStoreRatingDisplayValue);
  const isFreeDeliveryTagVisible = useSelector(getIsFreeDeliveryTagVisible);
  const freeShippingFormattedMinAmount = useSelector(getFreeShippingFormattedMinAmount);
  const freeShippingFormattedMinAmountWithOutSpacing = useSelector(getFreeShippingFormattedMinAmountWithOutSpacing);

  useEffect(() => {
    console.log('locationDisplayName: ', locationDisplayName);
    console.log('storeId: ', storeId);
    console.log('shippingType: ', shippingType);
    console.log('selectedDateDisplayValue: ', selectedDateDisplayValue);
    console.log('selectedTimeDisplayValue: ', selectedTimeDisplayValue);
    console.log('storeStatus: ', storeStatus);
    console.log('deliveryDistance: ', deliveryDistance);
    console.log('formattedShippingFee: ', formattedShippingFee);
    console.log('isAddressOutOfRange: ', isAddressOutOfRange);
    console.log('isAbleToReviewCart: ', isAbleToReviewCart);
    console.log('isFulfillMinimumConsumption: ', isFulfillMinimumConsumption);
    console.log('storeRating: ', storeRating);
    console.log('isFreeDeliveryTagVisible: ', isFreeDeliveryTagVisible);
    console.log('freeShippingFormattedMinAmount: ', freeShippingFormattedMinAmount);
    console.log('freeShippingFormattedMinAmountWithOutSpacing: ', freeShippingFormattedMinAmountWithOutSpacing);
  }, [
    locationDisplayName,
    storeId,
    shippingType,
    selectedDateDisplayValue,
    selectedTimeDisplayValue,
    storeStatus,
    deliveryDistance,
    formattedShippingFee,
    isAddressOutOfRange,
    isAbleToReviewCart,
    isFulfillMinimumConsumption,
    storeRating,
    isFreeDeliveryTagVisible,
    freeShippingFormattedMinAmount,
    freeShippingFormattedMinAmountWithOutSpacing,
  ]);

  return null;
}

Debug.displayName = 'Debug';

export default Debug;
