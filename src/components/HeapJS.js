/* eslint-disable no-undef */
/* eslint-disable jsx-a11y/iframe-has-title */
import React, { Component } from 'react';
import config from '../config';

class HeapJS extends Component {
  componentWillMount() {
    try {
      if (heap && heap.addUserProperties) {
        heap.addUserProperties({
          account: config.business,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}

export default HeapJS;
