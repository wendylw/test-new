import React, { Component, lazy } from 'react';
import ErrorToast from '../../../components/ErrorToast';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getPageError } from '../../../redux/modules/entities/error';
import { actions as appActionCreators, getOnlineStoreInfo, getError } from '../../redux/modules/app';
import Constants from '../../../utils/constants';
import '../../../App.scss';
const Home = lazy(() => import('../Home'));

class App extends Component {
  componentDidMount() {
    const { appActions, pageError } = this.props;
    const { fetchOnlineStoreInfo } = appActions;

    if (pageError) {
      return (window.location.href = `${Constants.ROUTER_PATHS.ORDERING_BASE}${Constants.ROUTER_PATHS.ERROR}`);
    }

    fetchOnlineStoreInfo();
  }

  handleClearError = () => {
    this.props.appActions.clearError();
  };

  handleCloseMessageModal = () => {
    this.props.appActions.hideMessageModal();
  };

  render() {
    const { error, pageError } = this.props;

    return (
      <main className="store-list">
        <Home />
        {error && !pageError.code ? <ErrorToast message={error} clearError={this.handleClearError} /> : null}
      </main>
    );
  }
}

export default connect(
  state => ({
    onlineStoreInfo: getOnlineStoreInfo(state),
    error: getError(state),
    pageError: getPageError(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActionCreators, dispatch),
  })
)(App);
