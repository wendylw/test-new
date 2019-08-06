/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { clientCoreApi } from '../../apiClient';
import apiGql from '../../apiGql';

import { shoppingCartType } from '../../views/propTypes';
import CurrencyNumber from '../../components/CurrencyNumber';

import config from '../../config';
import Constants from '../../Constants';

export class Billing extends Component {
  backToThankYou() {
    const { history } = this.props;
    const h = config.h();
    const query = new URLSearchParams(history.location.search);
    const receiptNumber = query.get('receiptNumber');

    history.replace(`${Constants.ROUTER_PATHS.THANK_YOU}?h=${h}&receiptNumber=${receiptNumber}`, history.location.state);
  }

  render() {
    const {
      onlineStoreInfo,
      shoppingCart = {}
    } = this.props;
    const {
      locale,
      currency,
    } = onlineStoreInfo || {};
    const {
      subtotal,
      total,
      tax,
      serviceCharge,  // TODO: Needs API
    } = shoppingCart;

    return (
      <section className="billing">
        <ul className="billing__list">
          <li className="billing__item flex flex-middle flex-space-between">
            <label className="gray-font-opacity">Subtotal</label>
            <span className="gray-font-opacity">
              <CurrencyNumber
                money={subtotal || 0}
                locale={locale}
                currency={currency}
              />
            </span>
          </li>
          <Query
            query={apiGql.GET_CORE_BUSINESS}
            client={clientCoreApi}
            variables={{ business: config.business, storeId: config.storeId }}
            onError={err => console.error('Can not get business.stores from core-api\n', err)}
          >
            {({ data: { business = {} } = {} }) => {
              if (!Array.isArray(business.stores) || !business.stores.length) {
                return null;
              }

              const { stores, enableServiceCharge, serviceChargeRate } = business;

              return (
                <React.Fragment>
                  <li className="billing__item flex flex-middle flex-space-between">
                    <label className="gray-font-opacity">{(stores[0].receiptTemplateData || {}).taxName || `Tax`}</label>
                    <span className="gray-font-opacity">
                      <CurrencyNumber
                        money={tax || 0}
                        locale={locale}
                        currency={currency}
                      />
                    </span>
                  </li>
                  {
                    enableServiceCharge
                      ? (
                        <li className="billing__item flex flex-middle flex-space-between">
                          <label className="gray-font-opacity">Service Charge {typeof serviceChargeRate === 'number' ? `${(serviceChargeRate * 100).toFixed(2)}%` : null}</label>
                          <span className="gray-font-opacity">{serviceCharge}</span>
                        </li>
                      )
                      : null
                  }
                </React.Fragment>
              );
            }}
          </Query>
          <li className="billing__item flex flex-middle flex-space-between">
            <label className="font-weight-bold">Total</label>
            <span className="font-weight-bold">
              <CurrencyNumber
                money={total || 0}
                locale={locale}
                currency={currency}
              />
            </span>
          </li>
        </ul>
      </section>
    )
  }
}

Billing.propTypes = {
  shoppingCart: shoppingCartType,
};

export default Billing;