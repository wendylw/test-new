import React, { Component } from 'react';
import StoreList from './components/StoreList';
import Header from '../../../components/Header';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOnlineStoreInfo, getError } from '../../redux/modules/app';
import { actions as homeActions, getStoreHashCode, getAllStores, showStores } from '../../redux/modules/home';

class App extends Component {
  state = {}

  componentWillMount() {
    const { homeActions } = this.props;

    homeActions.loadCoreStores();
  }

  componentDidMount() {
    this.redirectPage(this.props.stores);
  }

  componentWillReceiveProps(nextProps) {
    this.redirectPage(nextProps.stores);
  }

  redirectPage(stores) {
    const { stores: oldStores } = this.props;
    const valid = oldStores !== stores || (oldStores && oldStores.length && oldStores[0].id !== stores[0].id);

    // auto redirect when there only one store in the list
    if (valid && stores && stores.length === 1) {
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
    const {
      show,
      stores,
      onlineStoreInfo,
    } = this.props;
    const {
      logo,
      storeName
    } = onlineStoreInfo || {};

    if (!show) {
      return null;
    }

    if (stores && stores.length === 1) {
      return null;
    }

    return (
      <React.Fragment>
        <Header
          className="border__bottom-divider gray has-right"
          isPage={true}
          isStoreHome={true}
          logo={logo}
          title={storeName}
        />
        <section className="store-list__content">
          <h2 className="text-center">Please select a store to continue…</h2>

          <div className="list__container">
            {
              !stores || !stores.length
                ? <h3 className="text-center">something wrong, please try again later.</h3>
                : (
                  <StoreList
                    storeList={stores}
                    onSelect={this.handleSelectStore.bind(this)}
                  />
                )
            }
          </div>
        </section>
      </React.Fragment>
    );
  }
}

export default connect(
  state => ({
    show: showStores(state),
    hashCode: getStoreHashCode(state),
    onlineStoreInfo: getOnlineStoreInfo(state),
    stores: getAllStores(state),
    error: getError(state),
  }),
  dispatch => ({
    homeActions: bindActionCreators(homeActions, dispatch),
  }),
)(App);
