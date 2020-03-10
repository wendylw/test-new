import React, { Component, lazy } from 'react';
import ErrorToast from '../../../components/ErrorToast';
import DocumentFavicon from '../../../components/DocumentFavicon';
import faviconImage from '../../../images/favicon.ico';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getPageError } from '../../../redux/modules/entities/error';
import { actions as appActionCreators, getOnlineStoreInfo, getError } from '../../redux/modules/app';
import Constants from '../../../utils/constants';
import '../../../App.scss';
const Home = lazy(() => import('../Home'));

class App extends Component {
  componentDidMount() {
    const { appActions } = this.props;
    const { fetchOnlineStoreInfo } = appActions;

    this.visitErrorPage();
    fetchOnlineStoreInfo();
  }

  componentDidUpdate(prevProps) {
    const { pageError } = this.props;
    const { code } = prevProps.pageError || {};

    if (pageError.code && pageError.code !== code) {
      this.visitErrorPage();
    }
  }

  handleClearError = () => {
    this.props.appActions.clearError();
  };

  handleCloseMessageModal = () => {
    this.props.appActions.hideMessageModal();
  };

  visitErrorPage() {
    const { pageError } = this.props;

    if (pageError && pageError.code) {
      return (window.location.href = `${Constants.ROUTER_PATHS.ORDERING_BASE}${Constants.ROUTER_PATHS.ERROR}`);
    }
  }

  render() {
    const { error, pageError, onlineStoreInfo } = this.props;
    const { favicon } = onlineStoreInfo || {};

    return (
      <main className="store-list">
        <Home />
        {error && !pageError.code ? <ErrorToast message={error} clearError={this.handleClearError} /> : null}
        <DocumentFavicon icon={favicon || faviconImage} />
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
