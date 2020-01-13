import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ScrollObserver, getCurrentScrollId } from '../../../../../components/ScrollComponents';

class CurrentCategoryBar extends Component {
  getCurrentCategoryByScrollname = scrollname => {
    return (this.props.categories || []).find(category => category.name === scrollname);
  };

  render() {
    const { categories, isVerticalMenu } = this.props;
    const defaultId = categories[0] ? categories[0].id : '';

    return (
      <ScrollObserver
        containerId="CategoryNavContent"
        targetIdPrefix="category"
        defaultScrollId={getCurrentScrollId(isVerticalMenu) || defaultId}
        isVerticalMenu={isVerticalMenu}
        render={(scrollid, scrollToSmoothly) => {
          const currentCategory = categories.find(c => c.id === scrollid);

          return (
            <div className={`category-nav ${isVerticalMenu ? 'category-nav__vertical' : 'category-nav__horizontal'}`}>
              <div id="CategoryNavContent" className="category-nav__content">
                <ul className="category-nav__list text-middle">
                  {categories.map(c => {
                    const classList = [`category-nav__item ${isVerticalMenu ? 'text-left' : 'text-center'}`];

                    if (
                      document
                        .getElementById('root')
                        .getAttribute('class')
                        .includes('fixed')
                    ) {
                      let isActive = null;

                      if (document.getElementById(`category-${c.id}`)) {
                        isActive = document
                          .getElementById(`category-${c.id}`)
                          .getAttribute('class')
                          .includes('active');
                      }

                      if (isActive) {
                        classList.push('active');
                      }
                    } else {
                      if (currentCategory && currentCategory.id === c.id) {
                        classList.push('active');
                      }
                    }

                    return (
                      <li
                        id={`category-${c.id}`}
                        key={`category-${c.id}`}
                        className={classList.join(' ')}
                        onClick={() =>
                          scrollToSmoothly({
                            direction: 'y',
                            targetId: c.id,
                            isVerticalMenu,
                          })
                        }
                      >
                        <label className={isVerticalMenu ? '' : 'gray-font-opacity'}>{c.name}</label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        }}
      />
    );
  }
}

CurrentCategoryBar.propTypes = {
  isVerticalMenu: PropTypes.bool,
};

CurrentCategoryBar.defaultProps = {
  isVerticalMenu: false,
};

export default CurrentCategoryBar;
