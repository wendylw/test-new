import React from 'react';
import LocationPicker from './LocationPicker.js';

export default {
  title: 'Common/LocationPicker',
  component: LocationPicker,
};

const Template = args => {
  const body = document.getElementsByTagName('body')[0];
  const script = document.createElement('script');
  script.src =
    'https://maps.googleapis.com/maps/api/js?v=quarterly&key=%REACT_APP_GOOGLE_MAPS_API_KEY%&libraries=geometry,places';
  body.appendChild(script);
  <LocationPicker {...args} />;
};

export const LocationPickerTemplate = Template.bind({});
LocationPickerTemplate.args = {
  origin: { lat: 42.6020435, lng: 140.7858141 },
  radius: 50,
  country: 'MY',
  mode: 'ORIGIN_DEVICE',
  detectPosition: false,
};
