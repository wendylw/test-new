/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import { withRouter, Route } from "react-router";
import { compose } from 'react-apollo';
import MainTop from '../views/components/MainTop';
import MainBody from '../views/components/MainBody';
import FooterOperation from '../views/components/FooterOperation';
import Constants from '../Constants';
import ProductDetails from '../views/components/ProductDetails';
import ProductsEditCart from '../views/components/ProductsEditCart';
import MainMenu from '../views/components/MainMenu';
import withLocalState from '../libs/withLocalState';

export class Home extends Component {
  static propTypes = {

  }

  state = {
    showMenu: false,
  };

  isRouterPath(path) {
    return this.props.match.path === path;
  }

  asideClassNameByPath(path) {
    return this.isRouterPath(path) ? 'active' : '';
  }

  hideAside() {
    const { history } = this.props;
    history.replace(Constants.ROUTER_PATHS.HOME, history.location.state);
    
  }

  handleAsideClick(e) {
    if (e.target === e.currentTarget) {
      this.hideAside();
    }
  }

  render() {
    const { match, localState } = this.props;
    const hideClassName = [
      Constants.ROUTER_PATHS.HOME,
      Constants.ROUTER_PATHS.PORDUCTS,
    ].includes(match.path) ? '' : 'hide';

    console.log('localState => %o', localState);
    console.log('match => %o', match);

    return (
      <section className={`table-ordering__home ${hideClassName}`}>
        <MainTop />
        <MainBody />
        
        <Route
          path={`${Constants.ROUTER_PATHS.PORDUCTS}/:productId`}
          exact
          component={ProductDetails}
        />

        <Route
          path={`${Constants.ROUTER_PATHS.PORDUCTS}/all/edit`}
          exact
          component={ProductsEditCart}
        /> 

        {
          localState.showMenu ? <MainMenu /> : null
        }

        <FooterOperation />
      </section>
    )
  }
}

export default compose(
  withRouter,
  withLocalState,
)(Home);
