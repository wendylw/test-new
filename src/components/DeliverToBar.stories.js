import React from 'react';
import DeliverToBar from './DeliverToBar';
import { IconLocation, IconLeftArrow, IconEdit, IconScanner } from './Icons';

export default {
  title: 'Common/DeliverToBar',
  component: DeliverToBar,
};

const Template = args => <DeliverToBar {...args} />;

export const OrderingHomeTemplate = Template.bind({});
OrderingHomeTemplate.args = {
  className: 'ordering-home__deliver-to flex__shrink-fixed',
  content: 'Petaling Jaya, Selangor, Malaysia',
  extraInfo: 'Deliver At . TODAY . immediate',
  icon: <IconLocation className="icon icon__smaller text-middle flex__shrink-fixed" />,
  backIcon: <IconLeftArrow className="icon icon__big icon__default text-middle flex__shrink-fixed" />,
  showBackButton: false,
  children: <IconEdit className="icon icon__small icon__primary flex flex-middle flex__shrink-fixed" />,
};

export const MVPTemplate = Template.bind({});
MVPTemplate.args = {
  className: 'entry__deliver-to base-box-shadow',
  title: 'Deliver To',
  content: 'Petaling Jaya, Selangor, Malaysia',
  icon: <IconLocation className="icon icon__smaller text-middle flex__shrink-fixed" />,
};
