import React from 'react';
import LocationPicker from './LocationPicker';
import { IconDelete, IconEdit, IconLeftArrow, IconLocation } from './Icons';
import DeliverToBar from './DeliverToBar';
import PropTypes from 'prop-types';

export default {
  title: 'Common/LocationPicker',
  component: LocationPicker,
};

const Template = args => <LocationPicker {...args} />;
console.log(LocationPicker, 'LocationPickerComponent');
export const LocationPickerC = Template.bind({});
LocationPickerC.args = {
  origin: { lat: 2.12313, lng: 2.123123 },
  mode: 'ORIGIN_STORE',
  radius: 123,
  country: 'MY',
  onSelect: () => {},
};
