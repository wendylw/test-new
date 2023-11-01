import qs from 'qs';
import _get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import StoreList from './components/StoreList';
import Header from '../../../components/Header';
import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import { checkStoreIsOpened, getBusinessDateTime } from '../../../utils/store-utils';
import { getOnlineStoreInfo, getError } from '../../redux/modules/app';
import { getBusiness, getBusinessInfo, getBusinessUTCOffset } from '../../../ordering/redux/modules/app';
import { gtmSetUserProperties } from '../../../utils/gtm';
import * as NativeMethods from '../../../utils/native-methods';
import './StoresHome.scss';

import {
  actions as homeActionCreators,
  getStoreHashCode,
  getDeliveryStatus,
  getAllStores,
  showStores,
} from '../../redux/modules/home';
import NativeHeader from '../../../components/NativeHeader';

const { ROUTER_PATHS } = Constants;
class Home extends Component {
  componentDidMount = async () => {
    const { homeActions } = this.props;

    await homeActions.loadCoreStores();

    const { stores, location } = this.props;

    if (Array.isArray(stores) && stores.length === 1) {
      const defaultSelectStore = stores[0];
      const queries = qs.parse(location.search, { ignoreQueryPrefix: true });

      if (!(queries.s && queries.from === 'home')) {
        this.selectStore(defaultSelectStore.id);
      }
    }
  };

  selectStore = storeId => {
    const { enableDelivery } = this.props;
    gtmSetUserProperties({
      store: {
        id: storeId,
      },
    });

    if (this.isDinePath() || !enableDelivery) {
      this.gotoDine(storeId);
    } else {
      this.gotoDelivery(storeId);
    }
  };

  async visitStore(storeId) {
    const { homeActions } = this.props;

    await homeActions.getStoreHashData(storeId);

    const { hashCode } = this.props;

    if (hashCode) {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${hashCode || ''}`;
    }
  }

  async gotoDelivery(storeId) {
    const { homeActions, businessUTCOffset } = this.props;
    // 请求 coreBusiness
    await homeActions.loadCoreBusiness(storeId);
    const { businessInfo } = this.props;

    const store = _get(businessInfo, 'stores.0', null);

    const enablePreOrder = _get(store, 'qrOrderingSettings.enablePreOrder', false);

    const currentTime = getBusinessDateTime(businessUTCOffset);

    const isStoreOpened = store && checkStoreIsOpened(store, currentTime);

    // if store is closed,go straight to ordering page and let it display store is closed
    if (isStoreOpened) {
      window.location.href = `${window.location.href}${window.location.search ? '&' : '?'}s=${storeId}&from=home`;
      // homeActions.setCurrentStore(storeId);
    } else {
      await homeActions.getStoreHashData(storeId);
      const { hashCode } = this.props;
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${hashCode || ''}&type=delivery${
        enablePreOrder ? '&isPreOrder=true' : ''
      }`;
    }
  }

  gotoDine(storeId) {
    window.location.href = `${window.location.origin}${ROUTER_PATHS.DINE}${
      window.location.search ? `${window.location.search}&` : '?'
    }s=${storeId}&from=home`;
  }

  isDinePath() {
    const { match } = this.props;

    return match.path === Constants.ROUTER_PATHS.DINE;
  }

  render() {
    const { t, show, stores, onlineStoreInfo, isHome } = this.props;
    const { logo, storeName } = onlineStoreInfo || {};
    const isWebView = Utils.isWebview();

    if (!show) {
      return null;
    }

    return (
      isHome && (
        <section className="store-list__content" data-test-id="stores.home.container">
          {isWebView && (
            <NativeHeader
              isPage
              title={window.document.title}
              navFunc={() => {
                NativeMethods.closeWebView();
              }}
            />
          )}
          <Header
            className="flex-middle border__bottom-divider"
            contentClassName="flex-middle"
            data-test-id="stores.home.header"
            isPage
            isStoreHome
            logo={logo}
            title={storeName}
          />

          <section>
            <h2 className="padding-normal text-size-big text-center" data-testid="selectStoreDescription">
              {t('SelectStoreDescription')}
            </h2>

            {!stores || !stores.length ? (
              <h3 className="text-center">{t('SelectStoreErrorMessage')}</h3>
            ) : (
              <StoreList storeList={stores} onSelect={storeId => this.selectStore(storeId)} />
            )}
          </section>
        </section>
      )
    );
  }
}

Home.displayName = 'StoresHome';

Home.propTypes = {
  show: PropTypes.bool,
  isHome: PropTypes.bool,
  /* eslint-disable react/forbid-prop-types */
  stores: PropTypes.array,
  onlineStoreInfo: PropTypes.object,
  businessInfo: PropTypes.object,
  /* eslint-enable */
  hashCode: PropTypes.string,
  enableDelivery: PropTypes.bool,
  businessUTCOffset: PropTypes.number,
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
  match: PropTypes.shape({
    path: PropTypes.string,
  }),
  homeActions: PropTypes.shape({
    loadCoreStores: PropTypes.func,
    getStoreHashData: PropTypes.func,
    loadCoreBusiness: PropTypes.func,
  }),
};

Home.defaultProps = {
  show: false,
  isHome: false,
  stores: [],
  onlineStoreInfo: {},
  businessInfo: {},
  hashCode: '',
  enableDelivery: false,
  businessUTCOffset: 480,
  location: {
    search: '',
  },
  match: {
    path: '',
  },
  homeActions: {
    loadCoreStores: () => {},
    getStoreHashData: () => {},
    loadCoreBusiness: () => {},
  },
};

export default compose(
  withTranslation(),
  connect(
    state => ({
      show: showStores(state),
      hashCode: getStoreHashCode(state),
      enableDelivery: getDeliveryStatus(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      stores: getAllStores(state),
      error: getError(state),
      business: getBusiness(state),
      businessUTCOffset: getBusinessUTCOffset(state),
      businessInfo: getBusinessInfo(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(withRouter(Home));
