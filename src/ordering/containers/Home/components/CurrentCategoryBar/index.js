import React, { Component } from 'react';
import { ScrollObserver, getCurrentScrollId } from '../../../../../components/ScrollComponents';

class CurrentCategoryBar extends Component {
  getCurrentCategoryByScrollname = (scrollname) => {
    return (this.props.categories || []).find(category => category.name === scrollname)
  }

  render() {
    const { categories } = this.props;
    const defaultId = categories[0] ? categories[0].id : '';

    return (
      <ScrollObserver
        containerId="CategoryNavContent"
        defaultScrollId={getCurrentScrollId() || defaultId}
        render={(scrollid, scrollToSmoothly) => {
          const currentCategory = categories.find(c => c.id === scrollid);

          return (
            <div className="category__nav">
              <div id="CategoryNavContent" className="category__nav-content">
                <ul
                  className="category__nav-list text-middle"
                >
                  {
                    categories.map((c) => {
                      const classList = ['category__item text-center'];

                      if (document.getElementById('root').getAttribute('class').includes('fixed')) {
                        const isActive = document.getElementById(`category-${c.id}`).getAttribute('class').includes('active');

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
                          onClick={() => scrollToSmoothly({
                            direction: 'y',
                            targetId: c.id,
                          })}
                        >
                          <label>{c.name}</label>
                        </li>
                      );
                    })
                  }
                </ul>
              </div>
            </div>
          );
        }} />
    );
  }
}

export default CurrentCategoryBar;