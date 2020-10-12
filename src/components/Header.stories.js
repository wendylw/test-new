import React from 'react';
import { HeaderComponent } from './Header';
import { IconDelete } from './Icons';

export default {
  title: 'Common/Header',
  component: HeaderComponent,
};

const Template = args => <HeaderComponent {...args} />;

export const PageHeader = Template.bind({});
PageHeader.args = {
  className: 'flex-middle border__bottom-divider',
  isPage: true,
  title: 'DeliveryDetails',
  contentClassName: 'flex-middle',
};

export const PageHeaderWithContent = () => (
  <HeaderComponent
    className="flex-middle border__bottom-divider"
    isPage={true}
    title="Cart"
    contentClassName="flex-middle"
  >
    <button
      className="button flex__shrink-fixed padding-top-bottom-smaller padding-left-right-normal"
      onClick={() => {}}
    >
      <IconDelete className="icon icon__normal icon__error text-middle" />
      <span className="text-middle text-size-big text-error">Clear All</span>
    </button>
  </HeaderComponent>
);
