export const defaultLocations = {
  KualaLumpur: 'Kuala Lumpur',
};

export const getDefaultCoords = locationName => {
  const defaultLocation = defaultLocationData[locationName];
  return defaultLocation ? defaultLocation.coords : null;
};

const defaultLocationData = {
  [defaultLocations.KualaLumpur]: {
    name: defaultLocations.KualaLumpur,
    coords: {
      lng: 101.7027275,
      lat: 3.1588266,
    },
  },
};