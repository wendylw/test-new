/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import { compose, Query } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import withShoppingCart from '../libs/withShoppingCart';
import { shoppingCartType } from '../views/propTypes';
import CartItems from '../views/components/CartItems';
import CurrencyNumber from '../views/components/CurrencyNumber';
import ClearAll from '../views/components/ClearAll';
import { clientCoreApi } from '../apiClient';
import apiGql from '../apiGql';
import config from '../config';
import DocumentTitle from '../views/components/DocumentTitle';
import Constants from '../Constants';

export class Cart extends Component {
  static propTypes = {
    shoppingCart: shoppingCartType,
  }

  state = {
    additionalComments: null,
  }

  backToHome() {
    const { history } = this.props;
    history.replace(Constants.ROUTER_PATHS.HOME, history.location.state);
  }

  handleChangeAdditionalComments(e) {
    this.setState({
      additionalComments: e.target.value
    });
  }

  render() {
    const { shoppingCart = {}, history } = this.props;
    const { additionalComments } = this.state;
    const {
      count,
      subtotal,
      total,
      tax,
      items,
      serviceCharge,  // TODO: Needs API
    } = shoppingCart;

    // TODO: concern animation of hide or not.
    return (
      <DocumentTitle title={Constants.DOCUMENT_TITLE.CART}>
        <section className={`table-ordering__order` /* hide */}>
          <header className="header border__bottom-divider flex flex-middle flex-space-between">
            <figure className="header__image-container text-middle" onClick={this.backToHome.bind(this)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
            </figure>
            <h2 className="header__title font-weight-bold text-middle">{`Order ${count || 0} Items`}</h2>
            <ClearAll onClearedAll={() => { this.backToHome(); }} />
          </header>
          <div className="list__container">
            <CartItems />
            <div className="cart__note flex flex-middle flex-space-between" style={{ display: 'none' }}>
              <textarea
                rows="4"
                placeholder="Add a not to your order?"
                value={additionalComments || ''}
                onChange={this.handleChangeAdditionalComments.bind(this)}
              ></textarea>
              {
                additionalComments
                  ? (
                    <i
                      className="cart__close-button"
                      onClick={() => this.setState({ additionalComments: null })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        <path d="M0 0h24v24H0z" fill="none" />
                      </svg>
                    </i>
                  )
                  : null
              }
            </div>
          </div>
          <section className="billing">
            <ul className="billing__list">
              <li className="billing__item flex flex-middle flex-space-between">
                <label className="gray-font-opacity">Subtotal</label>
                <span className="gray-font-opacity"><CurrencyNumber money={subtotal || 0} /></span>
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
                        <CurrencyNumber classList="gray-font-opacity" money={tax || 0} />
                      </li>
                      {
                        enableServiceCharge
                          ? (
                            <li className="billing__item flex flex-middle flex-space-between">
                              <label className="gray-font-opacity">Service Charge {typeof serviceChargeRate === 'number' ? `${(serviceChargeRate * 100).toFixed(2)}%` : null}</label>
                              <CurrencyNumber classList="gray-font-opacity" money={serviceCharge || 0} />
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
                <span className="font-weight-bold"><CurrencyNumber money={total || 0} /></span>
              </li>
            </ul>
          </section>
          <footer className="footer-operation grid flex flex-middle flex-space-between">
            <div className="footer-operation__item width-1-3">
              <button
                className="billing__button button button__fill button__block dark font-weight-bold"
                onClick={this.backToHome.bind(this)}
              >Back</button>
            </div>
            <div className="footer-operation__item width-2-3">
              <button
                className={`billing__link button button__fill button__block font-weight-bold ${items && items.length > 0 ? '' : 'disabled'}`}
                onClick={() => history.push(Constants.ROUTER_PATHS.PAYMENT, {
                  additionalComments
                })}
              >Pay</button>
            </div>
          </footer>
        </section>
      </DocumentTitle>
    )
  }
}

export default compose(withRouter, withShoppingCart({
  props: ({ gqlShoppingCart: { loading, shoppingCart } }) => {
    if (loading) {
      return null;
    }
    return { shoppingCart };
  },
}))(Cart);
