import React, { Component } from 'react';
import ErrorPage from '../../../containers/ErrorPage';

import { connect } from 'react-redux';
import { getPageError } from '../../../redux/modules/entities/error';

export class Error extends Component {
  render() {
    const { error } = this.props;

    return <ErrorPage error={error} />;
  }
}

export default connect(
  state => ({
    error: getPageError(state),
  }),
  dispatch => ({})
)(Error);
