import React, { Component } from 'react';
import StoreList from './components/StoreList';
import { Query } from 'react-apollo';
import apiGql from '../../apiGql';
import { clientCoreApi } from '../../apiClient';
import config from '../../config';
import { get } from '../../libs/request';
import Constants from '../../Constants';
import '../../App.scss';

import MainTop from '../../views/components/MainTop';

class Stores extends Component {
  state = {
    redirectTo: '',
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
                    return 'something wrong, please try again later.';
                  }

                  return (
                    <StoreList data={business.stores.filter(store => store.isOnline)} onSelect={this.handleSelectStore} />
                  );
                }
              }
            </Query>
          </div>
        </section>
      </main>
    );
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
}

export default Stores;
