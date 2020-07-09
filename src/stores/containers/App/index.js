import React, { Component } from 'react';
import ErrorToast from '../../../components/ErrorToast';
import DocumentFavicon from '../../../components/DocumentFavicon';
import faviconImage from '../../../images/favicon.ico';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getPageError } from '../../../redux/modules/entities/error';
import { actions as appActionCreators, getOnlineStoreInfo, getError } from '../../redux/modules/app';
import {
  getDeliveryStatus,
  getCurrentStoreId,
  getAllStores,
  actions as homeActionCreators,
} from '../../redux/modules/home';
import Constants from '../../../utils/constants';
import '../../../App.scss';
import Home from '../Home';
import { withRouter } from 'react-router-dom';
import DeliveryMethods from '../DeliveryMethods';
import DineMethods from '../DineMethods';

import { gtmSetUserProperties } from '../../../utils/gtm';
import Utils from '../../../utils/utils';
import qs from 'qs';

class App extends Component {
  constructor(props) {
    super(props);
    const queries = qs.parse(decodeURIComponent(this.props.location.search), { ignoreQueryPrefix: true });

    if (queries.s && queries.from === 'home') {
      this.props.homeActions.setCurrentStore(queries.s);
    }
  }
  componentDidMount() {
    const { appActions, currentStoreId } = this.props;
    const { fetchOnlineStoreInfo } = appActions;

    if (this.isDinePath()) {
      Utils.removeExpectedDeliveryTime();
    }

    this.visitErrorPage();
    fetchOnlineStoreInfo().then(({ responseGql }) => {
      const { data } = responseGql;
      const { onlineStoreInfo } = data;
      gtmSetUserProperties({ onlineStoreInfo, store: { id: currentStoreId } });
    });
  }

  isDinePath() {
    return this.props.match.path === Constants.ROUTER_PATHS.DINE;
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

  renderDeliveryOrDineMethods() {
    const { enableDelivery, stores, currentStoreId } = this.props;

    if (this.isDinePath()) {
      return <DineMethods />;
    }

    if (enableDelivery) {
      return <DeliveryMethods store={stores.find(store => store.id === currentStoreId)} />;
    }
  }

  render() {
    const { error, pageError, onlineStoreInfo, currentStoreId } = this.props;
    const { favicon } = onlineStoreInfo || {};

    return (
      <main className="store-list">
        {currentStoreId ? this.renderDeliveryOrDineMethods() : <Home />}

        {error && !pageError.code ? <ErrorToast message={error.message} clearError={this.handleClearError} /> : null}
        <DocumentFavicon icon={favicon || faviconImage} />
      </main>
    );
  }
}

export default connect(
  state => ({
    onlineStoreInfo: getOnlineStoreInfo(state),
    enableDelivery: getDeliveryStatus(state),
    currentStoreId: getCurrentStoreId(state),
    stores: getAllStores(state),
    error: getError(state),
    pageError: getPageError(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActionCreators, dispatch),
    homeActions: bindActionCreators(homeActionCreators, dispatch),
  })
)(withRouter(App));
