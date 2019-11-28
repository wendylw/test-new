import React from 'react';
import PropTypes from 'prop-types';

class DocumentTitle extends React.Component {
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

DocumentTitle.propTypes = {
  title: PropTypes.string.isRequired,
};

export default DocumentTitle;
