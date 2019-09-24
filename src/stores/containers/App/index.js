import React, { Component, lazy } from 'react';
import ErrorToast from '../../../components/ErrorToast';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActions, getOnlineStoreInfo, getError } from '../../redux/modules/app';
import '../../../App.scss';
const Home = lazy(() => import('../Home'));

class App extends Component {
  componentDidMount() {
    const { fetchOnlineStoreInfo } = this.props.appActions;

    fetchOnlineStoreInfo();
  }

  handleClearError = () => {
    this.props.appActions.clearError();
  }

  handleCloseMessageModal = () => {
    this.props.appActions.hideMessageModal();
  }

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
