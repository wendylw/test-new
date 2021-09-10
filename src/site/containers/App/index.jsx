import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import ErrorToast from '../../../components/ErrorToast';
import SiteFooter from '../../components/SiteFooter';
import { appActionCreators, getError } from '../../redux/modules/app';
import Routes from '../../Routes';
import Utils from '../../../utils/utils';
import * as TngUtils from '../../../utils/tng-utils';

class SiteApp extends React.Component {
  showSiteFooter = false; // hide the siteFooter temporarily, could show it in the future

  componentDidMount = async () => {
    if (Utils.isTNGMiniProgram()) {
      TngUtils.setTabBarVisibility(true);
    }

    await this.props.appActions.ping();
  };

  render() {
    const { error, appActions } = this.props;
    // const { pathname } = window.location || {};
    // const isErrorPage = /^\/error/.test(pathname || '') || /^\/ordering\/location/.test(pathname || '');

    return (
      <React.Fragment>
        {error ? (
          <ErrorToast
            className="fixed-wrapper padding-normal"
            message={JSON.stringify(error)}
            clearError={appActions.clearError}
          />
        ) : null}
        {/* <SiteFakeHeader /> */}
        <Routes />
        {this.showSiteFooter && <SiteFooter />}
      </React.Fragment>
    );
  }
}
SiteApp.displayName = 'SiteApp';

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
