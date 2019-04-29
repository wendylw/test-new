/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { onlineCategoryMergedShoppingCartType } from '../propTypes';
import { ScrollObserver } from './ScrollComponents';

class MainMenuComponent extends Component {
  static propTypes = {
    onlineCategoryMergedShoppingCart: onlineCategoryMergedShoppingCartType,
  }

  render() {
    const { onlineCategoryMergedShoppingCart, toggleMenu } = this.props;

    console.log('onlineCategoryMergedShoppingCart => %o', onlineCategoryMergedShoppingCart);

    if (!onlineCategoryMergedShoppingCart) {
      return null;
    }

    return (
      <aside className="aside active" onClick={e => {
        if (e.currentTarget === e.target) {
          toggleMenu();
        }
      }}>
        <nav className="nav-pane">
          <ul className="nav-pane__list">
          {
            onlineCategoryMergedShoppingCart.map((category) => (
              <ScrollObserver key={category.id} render={(scrollname, scrollTo) => {
                // TODO: this scrollname value should always be top visiable scrollname.
                return (
                  <li className={`nav-pane__item ${scrollname === category.name ? 'active' : ''}`}>
                    <a
                      className="nav-pane__link flex flex-middle flex-space-between"
                      onClick={() => {
                        scrollTo(category.name);
                        toggleMenu();
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
      </aside>
    )
  }
}

export default MainMenuComponent;
