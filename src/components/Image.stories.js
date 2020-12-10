import React from 'react';
import Image from './Image';

export default {
  title: 'Common/Image',
  component: Image,
};

const Template = args => <Image {...args} />;

export const ImageTemplate = Template.bind({});
ImageTemplate.args = {
  className: '',
  alt: 'image demo',
};
