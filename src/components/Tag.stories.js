import React from 'react';
import Tag from './Tag';
import '../App.scss';

export default {
  title: 'Common/Tag',
  component: Tag,
};

export const ActiveTag = () => <Tag text="Best Seller" className="tag__card active" />;

export const InactiveTag = () => <Tag text="Best Seller" className="tag__card" />;
