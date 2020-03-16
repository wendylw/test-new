import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import StoreList from './components/StoreList';
import Header from '../../../components/Header';
import Constants from '../../../utils/constants';
import DeliveryMethods from './components/DeliveryMethods';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getOnlineStoreInfo, getError } from '../../redux/modules/app';
import { actions as homeActionCreators, getStoreHashCode, getAllStores, showStores } from '../../redux/modules/home';

class App extends Component {
  state = {};

  async componentDidMount() {
    const { homeActions } = this.props;

    await homeActions.loadCoreStores();
  }

  redirectPage(stores) {
    // auto redirect when there only one store in the list
    if (stores.length === 1) {
      this.handleSelectStore(stores[0].id);

      return;
    }
  }

  async handleSelectStore(storeId) {
    const { homeActions } = this.props;

    await homeActions.getStoreHashData(storeId);

    const { hashCode } = this.props;

    if (hashCode) {
      window.location.href = `${Constants.ROUTER_PATHS.ORDERING_BASE}/?h=${hashCode || ''}`;
    }
  }

  render() {
    const { t, show, stores, onlineStoreInfo } = this.props;
    const { logo, storeName } = onlineStoreInfo || {};

    if (!show) {
      return null;
    }

    if (stores && stores.length === 1) {
      return <DeliveryMethods store={stores[0]} />;
    }

    return (
      <section className="store-list__content">
        <Header
          className="border__bottom-divider gray has-right"
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
            <StoreList storeList={stores} onSelect={this.handleSelectStore.bind(this)} />
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
      onlineStoreInfo: getOnlineStoreInfo(state),
      stores: getAllStores(state),
      error: getError(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(App);
