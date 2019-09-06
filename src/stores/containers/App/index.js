import React, { Component, lazy } from 'react';
import ErrorToast from '../../../components/ErrorToast';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActions, getOnlineStoreInfo, getError } from '../../redux/modules/app';
import '../../../App.scss';
const Home = lazy(() => import('../Home'));

class App extends Component {
  render() {
    const { error } = this.props;

    return (
      <main className="store-list">
        <Home />
        {
          error
            ? <ErrorToast message={error} clearError={this.handleClearError} />
            : null
        }
      </main>
    );
  }

  componentDidMount() {
    const {
      fetchOnlineStoreInfo,
      // fetchBusiness,
    } = this.props.appActions;

    fetchOnlineStoreInfo();
    // fetchBusiness();
  }

  handleClearError = () => {
    this.props.appActions.clearError();
  }

  handleCloseMessageModal = () => {
    this.props.appActions.hideMessageModal();
  }
}

export default connect(
  state => ({
    onlineStoreInfo: getOnlineStoreInfo(state),
    error: getError(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActions, dispatch),
  }),
)(App);
