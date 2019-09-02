import React from 'react';
import PropTypes from 'prop-types';

class DocumentTitle extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
  };

  static setTitle(title) {
    if (title !== document.title) {
      document.title = title;
    }
  }

  displayName = 'DocumentTitle';

  componentWillMount() {
    DocumentTitle.setTitle(this.props.title);
  }

  componentWillReceiveProps(nextProps) {
    DocumentTitle.setTitle(nextProps.title);
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

export default DocumentTitle;
