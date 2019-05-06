/* eslint-disable no-undef */
import React, { Component } from 'react';
import config from '../../config';
 
class HeapJS extends Component {
  componentWillMount() {
    try {
      if (heap) {
        heap.addUserProperties({
          'account': config.business,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    return (
      <React.Fragment>{this.props.children}</React.Fragment>
    );
  }
}

export default HeapJS;