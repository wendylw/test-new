import React from 'react';
import Tag from './Tag';
import '../Common.scss';
import { DocsStory } from '@storybook/addon-docs/dist/blocks';

// See slots doc:
// https://github.com/storybookjs/storybook/blob/master/addons/docs/docs/docspage.md#slot-values
export default {
  title: 'Common/Tag',
  component: Tag,
  subcomponents: {},
};

// The Primary slot is computed from the first user-defined story for the component.
export const AllTags = () => (
  <div
    style={{
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'column',
      height: '500px',
      width: '100px',
    }}
  >
    <Tag text="Block Tag" className="tag tag__primary tag__block" />
    <Tag text="Small Tag" className="tag tag__primary tag__small" />
    <Tag text="Tag Primary" className="tag tag__primary" />
    <Tag text="Tag Reverse Primary" className="tag tag__reverse-primary" />
    <Tag text="Tag Primary Blue" className="tag tag__primary-blue" />
    <Tag text="Tag Error" className="tag tag__error" />
    <Tag text="Tag Info" className="tag tag__info" />
    <Tag text="Tag Default" className="tag tag__default" />
  </div>
);
