import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import StoreList from './components/StoreList';
import Header from '../../../components/Header';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getOnlineStoreInfo, getError } from '../../redux/modules/app';
import {
  actions as homeActionCreators,
  getStoreHashCode,
  getDeliveryStatus,
  getAllStores,
  showStores,
} from '../../redux/modules/home';

const { ROUTER_PATHS } = Constants;
class App extends Component {
  state = {};

  async componentDidMount() {
    const { homeActions } = this.props;

    await homeActions.loadCoreStores();
  }

  async visitStore(storeId) {
    const { homeActions } = this.props;

    await homeActions.getStoreHashData(storeId);

    const { hashCode } = this.props;

    if (hashCode) {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${hashCode || ''}`;
    }
  }

  setCurrentStoreId(storeId) {
    const { homeActions } = this.props;

    homeActions.setCurrentStore(storeId);
  }

  render() {
    const { t, show, stores, enableDelivery, onlineStoreInfo } = this.props;
    const { logo, storeName } = onlineStoreInfo || {};

    if (!show) {
      return null;
    }

    return (
      <section className="store-list__content">
        <Header
          className="border__bottom-divider flex-middle gray has-right"
          isPage={true}
          isStoreHome={true}
          logo={logo}
          title={storeName}
        />
        <h2 className="text-center">{t('SelectStoreDescription')}</h2>

        <div className="list__container">
          {!stores || !stores.length ? (
            <h3 className="text-center">{t('SelectStoreErrorMessage')}</h3>
          ) : (
            <StoreList
              storeList={stores}
              onSelect={enableDelivery ? this.setCurrentStoreId.bind(this) : this.visitStore.bind(this)}
            />
          )}
        </div>
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
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(App);
