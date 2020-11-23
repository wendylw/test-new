import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ScrollObserver, getCurrentScrollId } from '../../../../../components/ScrollComponents';

class CurrentCategoryBar extends PureComponent {
  render() {
    const { categories } = this.props;
    const defaultId = categories[0] ? categories[0].id : '';

    return (
      <ScrollObserver
        containerId="CategoryNavContent"
        targetIdPrefix="category"
        defaultScrollId={getCurrentScrollId(true) || defaultId}
        render={(scrollid, scrollToSmoothly) => {
          const currentCategory = categories.find(c => c.id === scrollid);

          return (
            <div className="category-nav flex__shrink-fixed">
              <div id="CategoryNavContent" className="category-nav__content">
                <ul className="category-nav__list text-middle">
                  {categories.map(c => {
                    const classList = [
                      'category-nav__item padding-top-bottom-normal padding-left-right-small border__bottom-divider text-left',
                    ];

                    // if (
                    //   document
                    //     .getElementById('root')
                    //     .getAttribute('class')
                    //     .includes('fixed')
                    // ) {
                    //   let isActive = null;

                    //   if (document.getElementById(`category-${c.id}`)) {
                    //     isActive = document
                    //       .getElementById(`category-${c.id}`)
                    //       .getAttribute('class')
                    //       .includes('active');
                    //   }

                    //   if (isActive) {
                    //     classList.push('active');
                    //   }
                    // } else {

                    // }

                    if (currentCategory && currentCategory.id === c.id) {
                      classList.push('active');
                    }

                    return (
                      <li
                        id={`category-${c.id}`}
                        key={`category-${c.id}`}
                        className={classList.join(' ')}
                        data-heap-name="ordering.home.category-item"
                        onClick={() =>
                          scrollToSmoothly({
                            targetId: c.id,
                            containerId: 'product-list',
                          })
                        }
                      >
                        <label className="category-nav__text">{c.name}</label>
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
  categories: PropTypes.array,
};

CurrentCategoryBar.defaultProps = {
  categories: [],
};

export default CurrentCategoryBar;
