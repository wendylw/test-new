import React from 'react';
import OtpModal from './OtpModal';

export default {
  title: 'Common/OtpModal',
  component: OtpModal,
  decorators: [
    Story => (
      <OtpModal>
        <Story />
      </OtpModal>
    ),
  ],
};

const Template = args => <OtpModal {...args} />;

export const OtpModalTemplate = Template.bind({});
OtpModalTemplate.args = {
  phone: '+8618813096217',
  buttonText: 'Ok',
  isLoading: true,
  ResendOtpTime: 20,
};
