import React from 'react';
import PropTypes from 'prop-types';
import faviconImage from '../images/favicon.ico';

class DocumentFavicon extends React.Component {
  static icon = '';

  componentDidMount() {
    DocumentFavicon.setIcon(this.props.icon);
  }

  static setIcon(icon) {
    icon = icon || faviconImage;

    if (icon !== DocumentFavicon.icon) {
      let link1 = document.querySelector('link[rel=apple-touch-icon-precomposed]');
      let link2 = document.querySelector('link[rel="shortcut icon"]');

      if (link1) {
        link1.parentNode.removeChild(link1);
      }

      if (link2) {
        link2.parentNode.removeChild(link2);
      }

      link1 = document.createElement('link');
      link1.rel = 'apple-touch-icon-precomposed';
      link1.href = icon;

      link2 = document.createElement('link');
      link2.rel = 'shortcut icon';
      link2.href = icon;

      const head = document.querySelector('head');
      head.appendChild(link1);
      head.appendChild(link2);

      // save for next time comparision
      DocumentFavicon.icon = icon;
    }
  }

  render() {
    const { children } = this.props;

    return <React.Fragment>{children}</React.Fragment>;
  }
}

DocumentFavicon.propTypes = {
  icon: PropTypes.string,
};

export default DocumentFavicon;
