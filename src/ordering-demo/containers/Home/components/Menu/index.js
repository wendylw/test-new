/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';

// TODO: migrate Scroll into here.
import { ScrollObserver, getCurrentScrollName } from '../../../../../views/components/ScrollComponents';

class Menu extends Component {
  render() {
    const { categories, onClickItem } = this.props;
    return (
      <nav className="nav-pane">
        <ul className="nav-pane__list">
          {
            categories.map((category) => {
              const { id, name, cartQuantity } = category;
              return (
                <ScrollObserver
                  key={id}
                  render={(scrollname, scrollTo) => {
                    const classNameLi = ['nav-pane__item'];
                    const currentScrollName = scrollname || getCurrentScrollName();
                    if (currentScrollName === name) {
                      classNameLi.push('active');
                    }
                    return (
                      <li className={classNameLi.join(' ')}>
                        <a
                          className="nav-pane__link flex flex-middle flex-space-between"
                          onClick={() => {
                            onClickItem();
                            scrollTo(name);
                          }}
                        >
                          <label className="nav-pane__label">{name}</label>
                          <span className="nav-pane__number gray-font-opacity">
                            {cartQuantity}
                          </span>
                        </a>
                      </li>
                    );
                  }}
                />
              );
            })
          }
        </ul>
      </nav>
    );
  }
}

export default Menu;