import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActions, getOnlineStoreInfo, getError, getMessageModal } from '../../redux/modules/app';
import Routes from '../Routes';
import '../../../App.scss';
import ErrorToast from './components/ErrorToast';
import MessageModal from '../../components/MessageModal';

class App extends Component {
  render() {
    console.log('_App.render()');
    const { error, messageModal } = this.props;

    return (
      <main className="table-ordering">
        <Routes />
        {
          error
            ? <ErrorToast message={error} clearError={this.handleClearError} />
            : null
        }
        {
          messageModal.show
            ? (
              <MessageModal
                data={messageModal}
                onHide={this.handleCloseMessageModal}
              />
            )
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
    messageModal: getMessageModal(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActions, dispatch),
  }),
)(App);
