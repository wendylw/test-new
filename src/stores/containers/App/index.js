import React, { Component } from 'react';
import ErrorToast from '../../../components/ErrorToast';
import DocumentFavicon from '../../../components/DocumentFavicon';
import faviconImage from '../../../images/favicon.ico';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getPageError } from '../../../redux/modules/entities/error';
import { actions as appActionCreators, getOnlineStoreInfo, getError } from '../../redux/modules/app';
import { actions as homeActionCreators } from '../../../ordering/redux/modules/home';
import {
  actions as storesActionsCreators,
  getDeliveryStatus,
  getCurrentStoreId,
  getAllStores,
  getStoreHashCode,
  getDeliveryRadius,
} from '../../redux/modules/home';
import Constants from '../../../utils/constants';
import '../../../App.scss';
import Home from '../Home';
import { withRouter } from 'react-router-dom';
import DeliveryMethods from '../DeliveryMethods';
import DineMethods from '../DineMethods';

import { gtmSetUserProperties } from '../../../utils/gtm';
import Utils from '../../../utils/utils';
import { computeStraightDistance } from '../../../utils/geoUtils';
import qs from 'qs';
import config from '../../../config';
const { ROUTER_PATHS, DELIVERY_METHOD } = Constants;

class App extends Component {
  constructor(props) {
    super(props);

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

  checkType = async type => {
    await this.props.storesActions.loadCoreStores();
    if (type.toLowerCase() === DELIVERY_METHOD.DELIVERY) {
      this.checkDeliveryAddress(type);
    } else if (type.toLowerCase() === DELIVERY_METHOD.PICKUP) {
      let stores = this.props.stores;
      if (stores.length) {
        if (stores.length === 1) {
          await this.props.storesActions.getStoreHashData(stores[0].id);
          this.props.history.replace({
            pathname: ROUTER_PATHS.ORDERING_BASE + ROUTER_PATHS.ORDERING_HOME,
            search: `h=${this.props.storeHash}&type=${type}`,
          });
          window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${this.props.storeHash}&type=${type}`;
        } else {
          window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_STORE_LIST}/?type=${type}`;
        }
      }
    } else {
      this.checkDeliveryAddress(DELIVERY_METHOD.DELIVERY);
    }
  };

  getNearlyStore = async (stores, type, deliveryAddress) => {
    stores.forEach(item => {
      if (item.location) {
        item.distance = computeStraightDistance(deliveryAddress.coords, {
          lat: item.location.latitude,
          lng: item.location.longitude,
        });
      }
    });
    stores = stores.filter(item => item.fulfillmentOptions.map(citem => citem.toLowerCase()).indexOf(type) !== -1);
    let nearly;
    stores.forEach(item => {
      if (!nearly) {
        nearly = item;
      } else {
        item.distance < nearly.distance && (nearly = item);
      }
    });
    let res = await this.props.storesActions.loadCoreBusiness(nearly.id);
    const deliveryRadius = res.responseGql.data.business.qrOrderingSettings.deliveryRadius;
    if (nearly.distance / 1000 < deliveryRadius) {
      return nearly;
    } else {
      Utils.setSessionVariable('outRange', deliveryRadius);
      this.props.history.replace({
        pathname: ROUTER_PATHS.ORDERING_BASE + ROUTER_PATHS.ORDERING_LOCATION,
        search: `type=${type}`,
      });
    }
  };

  checkDeliveryAddress = async type => {
    let deliveryAddress = Utils.getSessionVariable('deliveryAddress');
    if (deliveryAddress) {
      deliveryAddress = JSON.parse(deliveryAddress);
      let stores = this.props.stores;
      const nearly = this.getNearlyStore(stores, type, deliveryAddress);

      await this.props.storesActions.getStoreHashData(nearly.id);
      this.props.history.replace({
        pathname: ROUTER_PATHS.ORDERING_BASE + ROUTER_PATHS.ORDERING_HOME,
        search: `h=${this.props.storeHash}&type=${type}`,
      });
    } else {
      this.props.history.replace({
        pathname: ROUTER_PATHS.ORDERING_BASE + ROUTER_PATHS.ORDERING_HOME,
        search: `type=${type}`,
      });
      // window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?type=${type}`;
    }
  };

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
        {currentStoreId ? this.renderDeliveryOrDineMethods() : this.isDinePath() ? <Home /> : null}

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
    storeHash: getStoreHashCode(state),
    deliveryRadius: getDeliveryRadius(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActionCreators, dispatch),
    homeActions: bindActionCreators(homeActionCreators, dispatch),
    storesActions: bindActionCreators(storesActionsCreators, dispatch),
  })
)(withRouter(App));
