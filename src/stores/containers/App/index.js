import React, { Component } from 'react';
import ErrorToast from '../../../components/ErrorToast';
import DocumentFavicon from '../../../components/DocumentFavicon';
import faviconImage from '../../../images/favicon.ico';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getPageError } from '../../../redux/modules/entities/error';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getBusinessUTCOffset,
  getError,
} from '../../redux/modules/app';
import {
  actions as storesActionsCreators,
  getDeliveryStatus,
  getCurrentStoreId,
  getAllStores,
  getStoreHashCode,
  getDeliveryRadius,
} from '../../redux/modules/home';

import Constants from '../../../utils/constants';
import '../../../Common.scss';
import Home from '../Home';
import { withRouter } from 'react-router-dom';
import DeliveryMethods from '../DeliveryMethods';
import DineMethods from '../DineMethods';

import { gtmSetUserProperties } from '../../../utils/gtm';
import Utils from '../../../utils/utils';
import { findNearestAvailableStore } from '../../../utils/store-utils';
import qs from 'qs';
import config from '../../../config';
import { getBusinessDeliveryRadius } from '../../redux/modules/app';

const { ROUTER_PATHS, DELIVERY_METHOD } = Constants;
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHome: true,
    };

    const queries = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });

    if (queries.s && queries.from === 'home') {
      this.state.isHome = false;
    }
    if (!this.isDinePath()) {
      const search = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
      let { type } = search;
      if (!type) {
        type = DELIVERY_METHOD.DELIVERY;
      }
      this.checkCustomer(type);
    }
  }

  checkCustomer = async type => {
    if (config.storeId) {
      Utils.removeCookieVariable('__s', '');
    }
    this.checkType(type);
  };

  checkOnlyType = type => {
    const { stores } = this.props;

    let isOnlyType = true,
      onlyType;

    if (!(stores || []).length) return type;

    for (let store of stores) {
      if (store.fulfillmentOptions.length > 1) {
        isOnlyType = false;
        break;
      }
    }

    if (isOnlyType) {
      onlyType = stores[0].fulfillmentOptions[0].toLowerCase();
      for (let store of stores) {
        if (store.fulfillmentOptions[0].toLowerCase() !== onlyType) {
          isOnlyType = false;
          break;
        }
      }
    }

    if (isOnlyType) {
      type = onlyType;
      Utils.setLocalStorageVariable('ONLYTYPE', type);
    } else {
      Utils.removeLocalStorageVariable('ONLYTYPE');
    }

    return type;
  };

  checkType = async type => {
    await this.props.storesActions.loadCoreStores();

    type = this.checkOnlyType(type);

    if (!this.props.enableDelivery) {
      window.location.href = `${window.location.origin}${Constants.ROUTER_PATHS.DINE}`;
    }

    if (type.toLowerCase() === DELIVERY_METHOD.DELIVERY) {
      this.checkDeliveryAddress();
    } else if (type.toLowerCase() === DELIVERY_METHOD.PICKUP) {
      let stores = this.props.stores;
      if (stores.length) {
        if (stores.length === 1) {
          await this.props.storesActions.getStoreHashData(stores[0].id);
          this.gotoOrderingHome(type, decodeURIComponent(this.props.storeHash));
        } else {
          window.location.href = `${window.location.origin}${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_STORE_LIST}?type=${type}`;
        }
      }
    } else {
      this.checkDeliveryAddress();
    }
  };

  checkDeliveryAddress = async () => {
    const deliveryAddress = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
    const type = DELIVERY_METHOD.DELIVERY;

    if (!deliveryAddress.coords) {
      this.gotoOrderingHome(type);
      return;
    }

    await this.props.storesActions.loadCoreBusiness();

    const { businessUTCOffset, businessDeliveryRadius, stores } = this.props;

    const { store, distance } = findNearestAvailableStore(stores, {
      coords: deliveryAddress.coords,
      currentDate: new Date(),
      utcOffset: businessUTCOffset,
    });

    if (!store) {
      this.gotoOrderingHome(type);
      return;
    }

    if (distance / 1000 >= businessDeliveryRadius) {
      Utils.setSessionVariable('outRange', businessDeliveryRadius);
      this.gotoOrderingHome(type);
      return;
    }

    await this.props.storesActions.getStoreHashData(store.id);

    this.gotoOrderingHome(type, decodeURIComponent(this.props.storeHash));
  };

  gotoOrderingHome(type, h) {
    const queryString = qs.stringify(
      {
        type,
        h,
      },
      {
        addQueryPrefix: true,
      }
    );
    window.location.href = `${window.location.origin}${Constants.ROUTER_PATHS.ORDERING_BASE}${Constants.ROUTER_PATHS.ORDERING_HOME}${queryString}`;
  }

  componentDidMount() {
    const { appActions, currentStoreId } = this.props;
    const { fetchOnlineStoreInfo } = appActions;

    if (this.isDinePath()) {
      Utils.removeExpectedDeliveryTime();
    }

    this.visitErrorPage();
    fetchOnlineStoreInfo().then(({ responseGql }) => {
      const { data } = responseGql || {};
      const { onlineStoreInfo } = data || {};

      if (!onlineStoreInfo) return;
      gtmSetUserProperties({ onlineStoreInfo, store: { id: currentStoreId } });
    });

    const queries = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });

    if (queries.s && queries.from === 'home') {
      let timer = setInterval(() => {
        if (this.props.stores.length) {
          clearInterval(timer);
          this.props.storesActions.setCurrentStore(queries.s);
        }
      }, 300);
    } else {
      this.setState({
        isHome: true,
      });
    }
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
      <main className="store-list fixed-wrapper fixed-wrapper__main">
        {currentStoreId ? (
          this.renderDeliveryOrDineMethods()
        ) : this.isDinePath() ? (
          <Home isHome={this.state.isHome} />
        ) : null}

        {error && !pageError.code ? (
          <ErrorToast className="fixed" message={error.message} clearError={this.handleClearError} />
        ) : null}
        <DocumentFavicon icon={favicon || faviconImage} />
      </main>
    );
  }
}
App.displayName = 'StoresApp';

export default connect(
  state => ({
    onlineStoreInfo: getOnlineStoreInfo(state),
    enableDelivery: getDeliveryStatus(state),
    currentStoreId: getCurrentStoreId(state),
    stores: getAllStores(state),
    error: getError(state),
    pageError: getPageError(state),
    storeHash: getStoreHashCode(state),
    deliveryRadius: getDeliveryRadius(state),
    businessUTCOffset: getBusinessUTCOffset(state),
    businessDeliveryRadius: getBusinessDeliveryRadius(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActionCreators, dispatch),
    storesActions: bindActionCreators(storesActionsCreators, dispatch),
  })
)(withRouter(App));
