import React from 'react';
import PropTypes from 'prop-types';

class DocumentHeadInfo extends React.Component {
  static setHeadInfo({ title, description, keywords }) {
    if (title !== document.title) {
      document.title = title;
    }

    const metaDescription = document.querySelector('meta[name="description"]');
    const currentDescription = metaDescription.getAttribute('content');

    if (description && description !== currentDescription) {
      metaDescription.setAttribute('content', description);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const currentKeywords = metaKeywords.getAttribute('content');

    if (keywords && keywords !== currentKeywords) {
      metaKeywords.setAttribute('content', keywords);
    }
  }

  displayName = 'DocumentTitle';

  componentDidMount() {
    const { title, description, keywords } = this.props;

    DocumentHeadInfo.setHeadInfo({ title, description, keywords });
  }

  componentDidUpdate() {
    const { title, description, keywords } = this.props;

    DocumentHeadInfo.setHeadInfo({ title, description, keywords });
  }

  render() {
    const { children } = this.props;

    return <React.Fragment>{children}</React.Fragment>;
  }
}

DocumentHeadInfo.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  keywords: PropTypes.string,
};

export default DocumentHeadInfo;
