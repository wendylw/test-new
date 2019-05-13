import React, { Component } from 'react';
import Constants from '../../Constants';
import withOnlineStoreInfo from '../../libs/withOnlineStoreInfo';

class Manifest extends Component {
  componentDidMount() {
    const manifesPlaceholder = document.getElementById(Constants.MANIFEST.PLACEHOLDER_ID);
    if (manifesPlaceholder) {
      const manifestUrl = Constants.MANIFEST.PATH;
      const linkEl = document.createElement('link');
      linkEl.rel = "manifest";
      linkEl.href = manifestUrl;
      manifesPlaceholder.replaceWith(linkEl);
    }
  }

  render() {
    return <React.Fragment></React.Fragment>;
  }
}

export default withOnlineStoreInfo({
  props: ({ gqlOnlineStoreInfo: { loading, onlineStoreInfo } }) => {
    if (loading) {
      return null;
    }
    return {
      onlineStoreInfo: {
        
      }
    };
  },
})(Manifest);
