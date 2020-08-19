import React from 'react';
import DeliverToBar from './DeliverToBar';

export default {
  title: 'Common/DeliverToBar',
  component: DeliverToBar,
};

// const Template = args => <DeliverToBar {...args} />;

// export const Title = Template.bind({});
// Title.args = {
//   title: 'Cookie',
// };

export const Template = () => (
  <DeliverToBar
    className="ordering-home__deliver-to flex__shrink-fixed"
    content="SS2, Petaling Jaya, Selangor, Malaysia"
    backIcon={null}
    extraInfo="TODAY . immediate"
    showBackButton={false}
    icon={null}
  >
    {null}
  </DeliverToBar>
);
