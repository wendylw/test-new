import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import SiteFakeHeader from '../../components/SiteFakeHeader';
import ErrorToast from '../../../components/ErrorToast';
import Routes from '../../Routes';
import SiteFooter from '../../components/SiteFooter';
import { actions as appActionCreators, getError } from '../../redux/modules/app';

const SiteApp = ({ error, appActions }) => {
  return (
    <React.Fragment>
      {error ? <ErrorToast message={error} clearError={appActions.clearError} /> : null}
      <SiteFakeHeader />
      <Routes />
      <SiteFooter />
    </React.Fragment>
  );
};

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
