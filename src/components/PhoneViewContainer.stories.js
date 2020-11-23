import React from 'react';
import PhoneViewContainer from './PhoneViewContainer';

export default {
  title: 'Common/PhoneViewContainer',
  component: PhoneViewContainer,
};

const Template = args => <PhoneViewContainer {...args} />;

export const PhoneViewTemplate = Template.bind({});
PhoneViewTemplate.args = {
  phone: '+8618813096217',
  className: '',
  title: 'Please input phone number',
  country: 'MY',
  buttonText: 'ok',
  isLoading: true,
};
