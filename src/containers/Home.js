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

export class Home extends Component {
  static propTypes = {

  }

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
    const { match } = this.props;
    const hideClassName = [
      Constants.ROUTER_PATHS.HOME,
      Constants.ROUTER_PATHS.PORDUCTS,
    ].includes(match.path) ? '' : 'hide';

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

        <aside className="aside">
          <nav className="nav-pane">
            <ul className="nav-pane__list">
              <li className="nav-pane__item active">
                <a className="nav-pane__link flex flex-middle flex-space-between">
                  <label className="nav-pane__label">I Want Eat</label>
                  <span className="nav-pane__number gray-font-opacity">45</span>
                </a>
              </li>
              <li className="nav-pane__item">
                <a className="nav-pane__link flex flex-middle flex-space-between">
                  <label className="nav-pane__label">I Want Drink</label>
                  <span className="nav-pane__number gray-font-opacity">45</span>
                </a>
              </li>
              <li className="nav-pane__item">
                <a className="nav-pane__link flex flex-middle flex-space-between">
                  <label className="nav-pane__label">Hong Kong Style Wantan Noodle Wet and Dry</label>
                  <span className="nav-pane__number gray-font-opacity">45</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        <FooterOperation />
      </section>
    )
  }
}

export default compose(withRouter)(Home);
