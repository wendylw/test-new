import React from 'react';
import Tag from './Tag';
import '../App.scss';
import { DocsStory } from '@storybook/addon-docs/dist/blocks';

// See slots doc:
// https://github.com/storybookjs/storybook/blob/master/addons/docs/docs/docspage.md#slot-values
export default {
  title: 'Common/Tag',
  component: Tag,
  // subcomponents: {},
};

// The Primary slot is computed from the first user-defined story for the component.
export const AllTags = () => (
  <React.Fragment>
    <Tag key={'one'} text="Best Seller" className="tag__card active" />
    <Tag key={'two'} text="Closed Seller" className="tag__card" />
  </React.Fragment>
);

export const ActiveTag = () => <Tag text="Best Seller" className="tag__card active" />;

export const InactiveTag = () => <Tag text="Best Seller" className="tag__card" />;
