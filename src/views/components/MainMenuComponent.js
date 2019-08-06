/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { onlineCategoryMergedShoppingCartType } from '../propTypes';
import { ScrollObserver, getCurrentScrollName } from './ScrollComponents';
import Constants from '../../Constants';
import Aside from './Aside';

const { MENU } = Constants.HOME_ASIDE_NAMES;

class MainMenuComponent extends Component {
  toggleMenu() {
    const { match, history } = this.props;

    if (match.isExact) {
      history.replace(Constants.ROUTER_PATHS.HOME, history.location.state);
      return;
    }
  }

  render() {
    const {
      active,
      onlineCategoryMergedShoppingCart,
      toggleAside,
    } = this.props;

    if (!onlineCategoryMergedShoppingCart) {
      return null;
    }

    return (
      <Aside
        active={active}
        onClick={e => {
          if (e.currentTarget === e.target) {
            toggleAside({ asideName: MENU });
          }
        }}
      >
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
                          toggleAside({ asideName: MENU });
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

MainMenuComponent.propTypes = {
  active: PropTypes.bool,
  onlineCategoryMergedShoppingCart: onlineCategoryMergedShoppingCartType,
  toggleAside: PropTypes.func,
}

MainMenuComponent.defaultProps = {
  active: false,
  toggleAside: () => { }
};

export default MainMenuComponent;
