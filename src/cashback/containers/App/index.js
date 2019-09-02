import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActions, getOnlineStoreInfo, getError } from '../../redux/modules/app';
import Routes from '../Routes';
import '../../../App.scss';
import ErrorToast from './components/ErrorToast';

class App extends Component {
  render() {
    console.log('_App.render()');
    const { error } = this.props;

    return (
      <main className="loyalty">
        <Routes />
        {
          error
            ? <ErrorToast message={error} clearError={this.handleClearError} />
            : null
        }
      </main>
    );
  }

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
