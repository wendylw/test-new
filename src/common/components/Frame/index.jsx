/**
 * Frame
 * Common page wrapper for v2 UI.
 */

import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/base.scss';
// import FlexLayout from './FlexLayout';
import NormalLayout from './NormalLayout';

const Frame = props => {
  const { children, id } = props;
  // Keep both for now, refer to the comment in Frame.module.scss.
  // return <FlexLayout>{children}</FlexLayout>;

  return <NormalLayout id={id}>{children}</NormalLayout>;
};

Frame.propTypes = PropTypes.node.isRequired;

Frame.displayName = 'Frame';

export default Frame;
