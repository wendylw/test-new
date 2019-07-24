/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'react-apollo';
import withOnlinstStoreInfo from '../libs/withOnlineStoreInfo';
import withShoppingCart from '../libs/withShoppingCart';

import ClearAll from '../views/components/ClearAll';
import CartItems from '../views/components/CartItems';
import { shoppingCartType } from '../views/propTypes';

import Billing from '../views/components/Billing';
import DocumentTitle from '../views/components/DocumentTitle';

import Constants from '../Constants';

export class Cart extends Component {
  static propTypes = {
    shoppingCart: shoppingCartType,
  }

  backToHome() {
    const { history } = this.props;
    history.replace(Constants.ROUTER_PATHS.HOME, history.location.state);
  }

  render() {
    const {
      onlineStoreInfo,
      shoppingCart = {}
    } = this.props;
    const {
      count,
      items,
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
          </div>
          <Billing
            shoppingCart={shoppingCart}
            onlineStoreInfo={onlineStoreInfo}
          />
          <footer className="footer-operation grid flex flex-middle flex-space-between">
            <div className="footer-operation__item width-1-3">
              <button
                className="billing__button button button__fill button__block dark font-weight-bold"
                onClick={this.backToHome.bind(this)}
              >Back</button>
            </div>
            <div className="footer-operation__item width-2-3">
              <Link
                className={`billing__link button button__fill button__block font-weight-bold ${items && items.length > 0 ? '' : 'disabled'}`}
                to={Constants.ROUTER_PATHS.PAYMENT}
              >Pay</Link>
            </div>
          </footer>
        </section>
      </DocumentTitle>
    )
  }
}

export default compose(withRouter,
  withOnlinstStoreInfo({
    props: ({ gqlOnlineStoreInfo: { loading, onlineStoreInfo } }) => {
      if (loading) {
        return null;
      }
      return { onlineStoreInfo };
    },
  }),
  withShoppingCart({
    props: ({ gqlShoppingCart: { loading, shoppingCart } }) => {
      if (loading) {
        return null;
      }
      return { shoppingCart };
    },
  }))(Cart);
