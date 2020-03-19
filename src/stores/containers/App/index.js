import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import ErrorToast from '../../../components/ErrorToast';
import DocumentFavicon from '../../../components/DocumentFavicon';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActionCreators, getOnlineStoreInfo, getError } from '../../redux/modules/app';
import { getDeliveryStatus, getCurrentStoreId, getAllStores } from '../../redux/modules/home';
import '../../../App.scss';
import Home from '../Home';
import DeliveryMethods from '../DeliveryMethods';

class App extends Component {
  componentDidMount() {
    const { fetchOnlineStoreInfo } = this.props.appActions;

    fetchOnlineStoreInfo();
  }

  handleClearError = () => {
    this.props.appActions.clearError();
  };

  handleCloseMessageModal = () => {
    this.props.appActions.hideMessageModal();
  };

  getStoreIdFromRouterState = () => {
    const { location } = this.props;
    return location.state && location.state.storeId;
  };

  isDeliveryMethodsRouter = () => {
    const { location } = this.props;
    return location.search.includes('delivery-methods') && this.getStoreIdFromRouterState();
  };

  render = () => {
    const { error, onlineStoreInfo, stores, enableDelivery, currentStoreId } = this.props;

    return (
      <main className="store-list">
        {(this.isDeliveryMethodsRouter() || currentStoreId) && enableDelivery ? (
          <DeliveryMethods
            store={stores.find(store => store.id === currentStoreId || this.getStoreIdFromRouterState())}
          />
        ) : (
          <Home />
        )}

        {error ? <ErrorToast message={error} clearError={this.handleClearError} /> : null}
        {onlineStoreInfo ? <DocumentFavicon icon={onlineStoreInfo.favicon} /> : null}
      </main>
    );
  };
}

export default connect(
  state => ({
    onlineStoreInfo: getOnlineStoreInfo(state),
    enableDelivery: getDeliveryStatus(state),
    currentStoreId: getCurrentStoreId(state),
    stores: getAllStores(state),
    error: getError(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActionCreators, dispatch),
  })
)(withRouter(App));
