import React from 'react';
import { withRouter } from 'react-router-dom';
import { Query, compose } from 'react-apollo';
import apiGql from '../apiGql';
import config from '../config';
import Constants from '../Constants';
import { clientCoreApi } from '../apiClient';

const withCoreApiBusiness = TheComponent =>
  class WithCoreApiBusiness extends React.Component {
    goToError(message) {
      const { history } = this.props;

      history.replace({
        pathname: Constants.ROUTER_PATHS.ERROR,
        state: {
          message,
        },
      });
    }

    tryPeopleCount(response) {
      // const { history } = this.props;
      const { business } = response;

      const { /*enablePax, */subscriptionStatus, stores } = business || {};

      if (subscriptionStatus === 'Expired') {
        this.goToError('Account is expired.');
        return;
      }

      if (!Array.isArray(stores) || !stores.length) {
        this.goToError('Store is not found.');
        return;
      }

      // Everytime reload /home page, will effects a Pax selector.
      // if (enablePax && history.location.pathname === Constants.ROUTER_PATHS.HOME) {
      //   if (history.location.pathname.indexOf('/modal/people-count') === -1) {
      //     const peopleCountModalPath = `${history.location.pathname}/modal/people-count`;
      //     history.push(peopleCountModalPath);
      //   }
      // }
    }

    render() {
      const { children, ...props } = this.props;
      const { history } = this.props;

      return (
        <Query
          query={apiGql.GET_CORE_BUSINESS}
          client={clientCoreApi}
          variables={{ business: config.business, storeId: config.storeId }}
          onCompleted={this.tryPeopleCount.bind(this)}
          onError={() => {
            history.replace({
              pathname: Constants.ROUTER_PATHS.ERROR,
              state: { message: 'Account name is not found.' },
            });
          }}
        >
          {() => {
            return (
              <TheComponent coreBusiness={null} {...props}>
                {children}
              </TheComponent>
            )
          }}
        </Query>
      );
    }
  }

export default compose(withRouter, withCoreApiBusiness);
