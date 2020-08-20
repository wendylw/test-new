import React from 'react';
import DeliverToBar from './DeliverToBar';
import { IconLocation } from './Icons';

export default {
  title: 'Common/DeliverToBar',
  component: DeliverToBar,
};

export const OrderingHome = args => (
  <DeliverToBar
    className="ordering-home__deliver-to flex__shrink-fixed"
    icon={<IconLocation className="icon icon__smaller text-middle flex__shrink-fixed" />}
    extraInfo="Deliver to time"
    content="Address"
    backIcon={null}
    showBackButton={false}
    icon={null}
  >
    {null}
  </DeliverToBar>
);
