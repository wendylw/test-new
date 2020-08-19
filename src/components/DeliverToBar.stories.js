import React from 'react';
import DeliverToBar from './DeliverToBar';

export default {
  title: 'Common/DeliverToBar',
  component: DeliverToBar,
};

const Template = args => <DeliverToBar {...args} />;

export const Title = Template.bind({});
Title.args = {
  title: 'Cookie',
};
