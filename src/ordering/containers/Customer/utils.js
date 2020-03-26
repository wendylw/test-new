export const DeliveryDetailsStorageKey = 'deliveryDetails';

export const saveDeliveryDetails = async fields => {
  const deliveryDetails = await fetchDeliveryDetails();
  return sessionStorage.setItem(
    DeliveryDetailsStorageKey,
    JSON.stringify({
      ...deliveryDetails,
      ...fields,
    })
  );
};

export const fetchDeliveryDetails = async () => {
  try {
    return JSON.parse(sessionStorage.getItem(DeliveryDetailsStorageKey));
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const fetchDeliveryAddress = async () => {
  try {
    const deliveryAddress = JSON.parse(sessionStorage.getItem('deliveryAddress'));
    return deliveryAddress ? deliveryAddress.address : '';
  } catch (e) {
    console.error(e);
    return '';
  }
};
