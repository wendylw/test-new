import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import StoreList from './components/StoreList';
import Header from '../../../components/Header';
import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getOnlineStoreInfo, getError } from '../../redux/modules/app';
import { getBusiness } from '../../../ordering/redux/modules/app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { withRouter } from 'react-router-dom';
import { gtmSetUserProperties } from '../../../utils/gtm';

import {
  actions as homeActionCreators,
  getStoreHashCode,
  getDeliveryStatus,
  getAllStores,
  showStores,
} from '../../redux/modules/home';
import OfflineStoreModal from '../../../ordering/containers/Home/components/OfflineStoreModal';

const { ROUTER_PATHS } = Constants;
class App extends Component {
  state = {
    creatOfflineStoreOrder: '',
  };

  componentDidMount = async () => {
    await this.props.homeActions.loadCoreStores();
    if (Array.isArray(this.props.stores) && this.props.stores.length === 1) {
      const defaultSelectStore = this.props.stores[0];
      this.selectStore(defaultSelectStore.id);
    }

    this.setState({
      creatOfflineStoreOrderName: Utils.getSessionVariable('creatOfflineStoreOrderName'),
    });
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
    const { homeActions } = this.props;
    // 请求 coreBusiness
    await homeActions.loadCoreBusiness();
    // if store is closed,go straight to ordering page and let it display store is closed
    const { allBusinessInfo, business } = this.props;
    const { validDays, validTimeFrom, validTimeTo, enablePreOrder } = Utils.getDeliveryInfo({
      business,
      allBusinessInfo,
    });
    const isValidTimeToOrder = Utils.isValidTimeToOrder({ validDays, validTimeFrom, validTimeTo });
    if (isValidTimeToOrder || enablePreOrder) {
      homeActions.setCurrentStore(storeId);
    } else {
      await homeActions.getStoreHashData(storeId);
      const { hashCode } = this.props;
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${hashCode || ''}&type=delivery${
        enablePreOrder ? '&isPreOrder=true' : ''
      }`;
    }
  }

  gotoDine(storeId) {
    this.props.homeActions.setCurrentStore(storeId);
    this.props.history.push({
      pathname: ROUTER_PATHS.DINE,
      search: window.location.search,
    });
  }

  selectStore = storeId => {
    const { enableDelivery } = this.props;
    gtmSetUserProperties({
      store: {
        id: storeId,
      },
    });

    if (enableDelivery) {
      this.gotoDelivery(storeId);
    } else {
      this.gotoDine(storeId);
    }
  };
  renderOfflineModal = enableLiveOnline => {
    console.log(this.state.creatOfflineStoreOrder, 'this.state.creatOfflineStoreOrder');
    return <OfflineStoreModal currentStoreName={this.state.creatOfflineStoreOrder} enableLiveOnline={false} />;
  };
  render() {
    const { t, show, stores, onlineStoreInfo } = this.props;
    const { logo, storeName } = onlineStoreInfo || {};

    if (!show) {
      return null;
    }

    return (
      <section className="store-list__content">
        <Header
          className="border__bottom-divider gray has-right flex-middle"
          isPage={true}
          isStoreHome={true}
          logo={logo}
          title={storeName}
        />
        <h2 className="text-center" data-testid="selectStoreDescription">
          {t('SelectStoreDescription')}
        </h2>

        <div className="list__container">
          {!stores || !stores.length ? (
            <h3 className="text-center">{t('SelectStoreErrorMessage')}</h3>
          ) : (
            <StoreList storeList={stores} onSelect={storeId => this.selectStore(storeId)} />
          )}
        </div>
        {this.state.creatOfflineStoreOrder && this.renderOfflineModal()}
      </section>
    );
  }
}

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
      allBusinessInfo: getAllBusinesses(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(withRouter(App));
