import qs from 'qs';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ErrorToast from '../../../components/ErrorToast';
import DocumentFavicon from '../../../components/DocumentFavicon';
import faviconImage from '../../../images/favicon.ico';
import { getPageError } from '../../../redux/modules/entities/error';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getBusinessUTCOffset,
  getError,
  getBusinessDeliveryRadius,
} from '../../redux/modules/app';
import {
  actions as storesActionsCreators,
  getDeliveryStatus,
  getCurrentStoreId,
  getAllStores,
  getStoreHashCode,
  getDeliveryRadius,
} from '../../redux/modules/home';
import { getAddressInfo as getAddressInfoThunk } from '../../../redux/modules/address/thunks';
import { getAddressCoords } from '../../../redux/modules/address/selectors';
import Constants from '../../../utils/constants';
import '../../../Common.scss';
import Home from '../Home';
import DeliveryMethods from '../DeliveryMethods';
import DineMethods from '../DineMethods';

import { gtmSetUserProperties } from '../../../utils/gtm';
import Utils from '../../../utils/utils';
import { findNearestAvailableStore } from '../../../utils/store-utils';
import config from '../../../config';

const { ROUTER_PATHS, DELIVERY_METHOD } = Constants;
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHome: true,
    };

    const { location } = this.props;
    const queries = qs.parse(location.search, { ignoreQueryPrefix: true });

    if (queries.s && queries.from === 'home') {
      this.state.isHome = false;
    }
  }

  componentDidMount = async () => {
    const { appActions, currentStoreId, getAddressInfo, history, location } = this.props;
    const { fetchOnlineStoreInfo } = appActions;

    if (this.isDinePath()) {
      Utils.removeExpectedDeliveryTime();
    } else {
      const search = qs.parse(history.location.search, { ignoreQueryPrefix: true });
      let { type } = search;
      if (!type) {
        type = DELIVERY_METHOD.DELIVERY;
      }
      await getAddressInfo();
      this.checkCustomer(type);
    }

    this.visitErrorPage();
    fetchOnlineStoreInfo().then(({ responseGql }) => {
      const { data } = responseGql || {};
      const { onlineStoreInfo } = data || {};

      if (!onlineStoreInfo) return;
      gtmSetUserProperties({ onlineStoreInfo, store: { id: currentStoreId } });
    });

    const queries = qs.parse(location.search, { ignoreQueryPrefix: true });

    if (queries.s && queries.from === 'home') {
      // eslint-disable-next-line prefer-const
      let timer = setInterval(() => {
        const { stores, storesActions } = this.props;
        if (stores.length) {
          clearInterval(timer);
          storesActions.setCurrentStore(queries.s);
        }
      }, 300);
    } else {
      this.setState({
        isHome: true,
      });
    }
  };

  componentDidUpdate(prevProps) {
    const { pageError } = this.props;
    const { code } = prevProps.pageError || {};

    if (pageError.code && pageError.code !== code) {
      this.visitErrorPage();
    }
  }

  checkCustomer = async type => {
    if (config.storeId) {
      Utils.removeCookieVariable('__s');
    }
    this.checkType(type);
  };

  checkOnlyType = defaultType => {
    const { stores } = this.props;

    if (!(stores || []).length) return defaultType;

    const isMultipleType = stores.some(store => store.fulfillmentOptions.length > 1);

    if (!isMultipleType) {
      const oneType = stores[0].fulfillmentOptions[0].toLowerCase();
      const isSameType = stores.every(store => store.fulfillmentOptions[0].toLowerCase() === oneType);
      if (isSameType) {
        return oneType;
      }
    }

    return defaultType;
  };

  checkType = async shippingType => {
    const { storesActions } = this.props;

    await storesActions.loadCoreStores();

    const type = this.checkOnlyType(shippingType);

    const { enableDelivery } = this.props;

    if (!enableDelivery) {
      window.location.href = `${window.location.origin}${Constants.ROUTER_PATHS.DINE}`;
    }

    if (type.toLowerCase() === DELIVERY_METHOD.DELIVERY) {
      this.checkDeliveryAddress();
    } else if (type.toLowerCase() === DELIVERY_METHOD.PICKUP) {
      const { stores } = this.props;
      if (stores.length) {
        if (stores.length === 1) {
          await storesActions.getStoreHashData(stores[0].id);
          const { storeHash } = this.props;
          this.gotoOrderingHome(type, decodeURIComponent(storeHash));
        } else {
          window.location.href = `${window.location.origin}${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_STORE_LIST}?type=${type}`;
        }
      }
    } else {
      this.checkDeliveryAddress();
    }
  };

  checkDeliveryAddress = async () => {
    const { addressCoords, storesActions } = this.props;
    const type = DELIVERY_METHOD.DELIVERY;

    if (!addressCoords) {
      this.gotoOrderingHome(type);
      return;
    }

    await storesActions.loadCoreBusiness();

    const { businessUTCOffset, businessDeliveryRadius, stores } = this.props;

    const { store, distance } = findNearestAvailableStore(stores, {
      coords: addressCoords,
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

    await storesActions.getStoreHashData(store.id);

    const { storeHash } = this.props;

    this.gotoOrderingHome(type, decodeURIComponent(storeHash));
  };

  handleClearError = () => {
    const { appActions } = this.props;

    appActions.clearError();
  };

  handleCloseMessageModal = () => {
    const { appActions } = this.props;

    appActions.hideMessageModal();
  };

  isDinePath() {
    const { match } = this.props;

    return match.path === Constants.ROUTER_PATHS.DINE;
  }

  visitErrorPage() {
    const { pageError } = this.props;

    if (pageError && pageError.code) {
      window.location.href = `${Constants.ROUTER_PATHS.ORDERING_BASE}${Constants.ROUTER_PATHS.ERROR}`;
    }
  }

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

  renderDeliveryOrDineMethods() {
    const { enableDelivery, stores, currentStoreId } = this.props;

    if (this.isDinePath()) {
      return <DineMethods />;
    }

    if (enableDelivery) {
      return <DeliveryMethods store={stores.find(store => store.id === currentStoreId)} />;
    }

    return null;
  }

  render() {
    const { isHome } = this.state;
    const { error, pageError, onlineStoreInfo, currentStoreId } = this.props;
    const { favicon } = onlineStoreInfo || {};

    return (
      <main className="store-list fixed-wrapper fixed-wrapper__main">
        {currentStoreId ? this.renderDeliveryOrDineMethods() : this.isDinePath() ? <Home isHome={isHome} /> : null}

        {error && !pageError.code ? (
          <ErrorToast className="fixed" message={error.message} clearError={this.handleClearError} />
        ) : null}
        <DocumentFavicon icon={favicon || faviconImage} />
      </main>
    );
  }
}

App.displayName = 'StoresApp';

App.propTypes = {
  storeHash: PropTypes.string,
  currentStoreId: PropTypes.string,
  enableDelivery: PropTypes.bool,
  getAddressInfo: PropTypes.func,
  businessUTCOffset: PropTypes.number,
  businessDeliveryRadius: PropTypes.number,
  appActions: PropTypes.shape({
    clearError: PropTypes.func,
    hideMessageModal: PropTypes.func,
    fetchOnlineStoreInfo: PropTypes.func,
  }),
  storesActions: PropTypes.shape({
    loadCoreStores: PropTypes.func,
    setCurrentStore: PropTypes.func,
    loadCoreBusiness: PropTypes.func,
    getStoreHashData: PropTypes.func,
  }),
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
  addressCoords: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  match: PropTypes.shape({
    path: PropTypes.string,
  }),
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  /* eslint-disable react/forbid-prop-types */
  stores: PropTypes.array,
  pageError: PropTypes.object,
  onlineStoreInfo: PropTypes.object,
  /* eslint-enable */
};

App.defaultProps = {
  storeHash: null,
  currentStoreId: '',
  addressCoords: null,
  enableDelivery: false,
  businessUTCOffset: 480,
  businessDeliveryRadius: 0,
  getAddressInfo: () => {},
  appActions: {
    clearError: () => {},
    hideMessageModal: () => {},
    fetchOnlineStoreInfo: () => {},
  },
  storesActions: {
    loadCoreStores: () => {},
    setCurrentStore: () => {},
    loadCoreBusiness: () => {},
    getStoreHashData: () => {},
  },
  location: {
    search: '',
  },
  match: {
    path: '',
  },
  error: null,
  pageError: {},
  onlineStoreInfo: {},
  stores: [],
};

export default connect(
  state => ({
    onlineStoreInfo: getOnlineStoreInfo(state),
    enableDelivery: getDeliveryStatus(state),
    currentStoreId: getCurrentStoreId(state),
    stores: getAllStores(state),
    error: getError(state),
    pageError: getPageError(state),
    storeHash: getStoreHashCode(state),
    addressCoords: getAddressCoords(state),
    deliveryRadius: getDeliveryRadius(state),
    businessUTCOffset: getBusinessUTCOffset(state),
    businessDeliveryRadius: getBusinessDeliveryRadius(state),
  }),
  dispatch => ({
    getAddressInfo: bindActionCreators(getAddressInfoThunk, dispatch),
    appActions: bindActionCreators(appActionCreators, dispatch),
    storesActions: bindActionCreators(storesActionsCreators, dispatch),
  })
)(withRouter(App));
