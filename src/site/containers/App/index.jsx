import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import ErrorToast from '../../../components/ErrorToast';
import Routes from '../../Routes';
import SiteFooter from '../../components/SiteFooter';
import { appActionCreators, getError } from '../../redux/modules/app';

class SiteApp extends React.Component {
  componentDidMount = async () => {
    await this.props.appActions.ping();
  };

  render() {
    const { error, appActions } = this.props;
    const { pathname } = window.location || {};
    const isErrorPage = /^\/error/.test(pathname || '');

    return (
      <React.Fragment>
        {error ? <ErrorToast message={error} clearError={appActions.clearError} /> : null}
        {/* <SiteFakeHeader /> */}
        <Routes />
        {isErrorPage ? null : <SiteFooter />}
      </React.Fragment>
    );
  }
}

export default compose(
  connect(
    state => ({
      error: getError(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(SiteApp);