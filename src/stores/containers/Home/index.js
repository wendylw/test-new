import React, { Component } from 'react';
import StoreList from './components/StoreList/index.js';
import Header from '../../../components/Header';

import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOnlineStoreInfo, getError } from '../../redux/modules/app';
import { actions as homeActions, getBusinessInfo, getStoreHashCode } from '../../redux/modules/home';

class App extends Component {
  state = {
    redirectTo: '',
  }

  componentWillMount() {
    const { homeActions } = this.props;

    homeActions.loadCoreBusiness();
  }

  handleSelectStore() {
    const {
      history,
      hashCode,
    } = this.props;

    history.push({
      pathname: `${Constants.ROUTER_PATHS.ORDERING_BASE}/`,
      search: `?h=${hashCode || ''}`
    });
  }

  render() {
    const {
      businessInfo,
      onlineStoreInfo,
    } = this.props;
    const {
      logo,
      storeName
    } = onlineStoreInfo;
    const { stores } = businessInfo || {};

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
    hashCode: getStoreHashCode(state),
    businessInfo: getBusinessInfo(state),
    onlineStoreInfo: getOnlineStoreInfo(state),
    error: getError(state),
  }),
  dispatch => ({
    homeActions: bindActionCreators(homeActions, dispatch),
  }),
)(App);
