import React, { Component } from 'react';
import StoreList from './components/StoreList';
import '../../App.scss';

import { Query } from 'react-apollo';
import apiGql from '../../apiGql';
import { clientCoreApi } from '../../apiClient';

import config from '../../config';
import { get } from '../../utils/request';
import Constants from '../../utils/constants';

import MainTop from '../../views/components/MainTop';

class Stores extends Component {
  state = {
    redirectTo: '',
  }

  handleQueryCompleted = (data) => {
    const { business } = data;

    if (business && business.stores.length === 1) {
      // get first store and redirect to
      this.handleSelectStore(business.stores[0].id);
    }
  }

  handleFetchStoresFailed = (err) => {
    console.error('fetch stores from core-api failed: %o', err);
  }

  handleSelectStore = async (storeId) => {
    // get url
    try {
      const response = await get(`/api/ordering/stores/${storeId}?a=redirectTo`)

      if (!response.ok) {
        return;
      }

      const { redirectTo: hash } = response.data;
      const redirectTo = `${Constants.ROUTER_PATHS.INDEX}?h=${hash}`;

      // use browser history to requery current page from server.
      window.location.href = redirectTo;
      return;
    } catch (e) {
      console.error('failed to fetch store redirectTo URL: storeId = %o', storeId);
      return;
    }
  }

  render() {
    return (
      <main className="store-list">
        <MainTop />
        <section className="store-list__content">
          <h2 className="text-center">Please select a store to continue…</h2>

          <div className="list__container">

            <Query
              query={apiGql.GET_CORE_STORES}
              client={clientCoreApi}
              variables={{ business: config.business }}
              onCompleted={this.handleQueryCompleted}
              onError={this.handleFetchStoresFailed}
            >
              {
                (response) => {
                  const { business } = response.data || {};

                  if (response.loading) {
                    return 'loading...';
                  }

                  if (!business || !business.stores) {
                    return <h3 className="text-center">something wrong, please try again later.</h3>;
                  }

                  return (
                    <StoreList storeList={business.stores.filter(store => store.isOnline && !store.isDeleted)} onSelect={this.handleSelectStore} />
                  );
                }
              }
            </Query>
          </div>
        </section>
      </main>
    );
  }
}

export default Stores;
