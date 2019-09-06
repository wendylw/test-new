import React, { Component } from 'react';
import StoreList from './components/StoreList';
import Header from '../../../components/Header';

// import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOnlineStoreInfo, getError } from '../../redux/modules/app';
import { actions as homeActions, getBusinessInfo, getStoreHashCode, showStores } from '../../redux/modules/home';

class App extends Component {
  state = {}

  async componentWillMount() {
    const { homeActions } = this.props;

    // await homeActions.loadCoreBusiness();
    await homeActions.loadCoreStores();
  }

  componentDidMount() {
    this.redirectPage(this.props.businessInfo);
  }

  componentDidUpdate(nextProps) {
    this.redirectPage(nextProps.businessInfo);
  }

  redirectPage(businessInfo) {
    const { stores } = businessInfo || {};

    // auto redirect when there only one store in the list
    if (stores && stores.length === 1) {
      // this.handleSelectStore(stores[0].id);

      return;
    }
  }

  async handleSelectStore(storeId) {
    const { homeActions } = this.props;

    await homeActions.getStoreHashCode(storeId);

    const { hashCode } = this.props;

    if (hashCode) {
      // window.location.href = `${Constants.ROUTER_PATHS.ORDERING_BASE}/?h=${hashCode || ''}`;
    }
  }

  render() {
    const {
      show,
      businessInfo,
      onlineStoreInfo,
    } = this.props;
    const {
      logo,
      storeName
    } = onlineStoreInfo || {};
    const { stores } = businessInfo || {};

    if (!show) {
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
                    storeList={stores.filter(store => store.isOnline && !store.isDeleted)}
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
    businessInfo: getBusinessInfo(state),
    onlineStoreInfo: getOnlineStoreInfo(state),
    error: getError(state),
  }),
  dispatch => ({
    show: false,
    homeActions: bindActionCreators(homeActions, dispatch),
  }),
)(App);
