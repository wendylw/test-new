import React, { Component } from 'react';
import Constants from '../../Constants';

class Manifest extends Component {
  componentDidMount() {
    const manifesPlaceholder = document.getElementById(Constants.MANIFEST.PLACEHOLDER_ID);
    if (manifesPlaceholder) {
      const manifestUrl = `${Constants.MANIFEST.PATH}${window.location.search}`;
      const linkEl = document.createElement('link');
      linkEl.rel = "manifest";
      linkEl.href = manifestUrl;
      manifesPlaceholder.replaceWith(linkEl);
    }
  }

  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}

export default Manifest;
