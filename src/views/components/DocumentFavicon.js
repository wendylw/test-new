import React from 'react';
import PropTypes from 'prop-types';

class DocumentFavicon extends React.Component {
  static propTypes = {
    icon: PropTypes.string.isRequired,
  };

  static icon = '';

  static setIcon(icon) {
    if (icon && icon !== DocumentFavicon.icon) {

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

  displayName = 'DocumentFavicon';

  componentWillMount() {
    DocumentFavicon.setIcon(this.props.icon);
  }

  componentWillReceiveProps(nextProps) {
    DocumentFavicon.setIcon(nextProps.icon);
  }

  render() {
    const { children } = this.props;

    return (
      <React.Fragment>
        {children}
      </React.Fragment>
    );
  }
}

export default DocumentFavicon;
