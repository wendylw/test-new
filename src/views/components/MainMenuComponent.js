/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { onlineCategoryMergedShoppingCartType } from '../propTypes';
import { ScrollObserver, getCurrentScrollName } from './ScrollComponents';
import Constants from '../../Constants';
import Aside from './Aside';

class MainMenuComponent extends Component {
  static propTypes = {
    onlineCategoryMergedShoppingCart: onlineCategoryMergedShoppingCartType,
  }

  toggleMenu() {
    const { match, history } = this.props;
    
    if (match.isExact) {
      history.replace(Constants.ROUTER_PATHS.HOME, history.location.state);
      return;
    }
  }

  render() {
    const { onlineCategoryMergedShoppingCart } = this.props;

    if (!onlineCategoryMergedShoppingCart) {
      return null;
    }

    return (
      <Aside active onClick={e => {
        if (e.currentTarget === e.target) {
          this.toggleMenu();
        }
      }}>
        <nav className="nav-pane">
          <ul className="nav-pane__list">
          {
            onlineCategoryMergedShoppingCart.map((category) => (
              <ScrollObserver key={category.id} render={(scrollname, scrollTo) => {
                const currentScrollName = scrollname || getCurrentScrollName();

                return (
                  <li className={`nav-pane__item ${(currentScrollName) === category.name ? 'active' : ''}`}>
                    <a
                      className="nav-pane__link flex flex-middle flex-space-between"
                      onClick={() => {
                        scrollTo(category.name);
                        this.toggleMenu();
                      }}
                    >
                      <label className="nav-pane__label">{category.name}</label>
                      <span className="nav-pane__number gray-font-opacity">{category.cartQuantity}</span>
                    </a>
                  </li>
                );
              }} />
            ))
          }
          </ul>
        </nav>
      </Aside>
    )
  }
}

export default MainMenuComponent;
