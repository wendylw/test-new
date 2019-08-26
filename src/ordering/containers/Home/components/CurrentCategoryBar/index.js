import React, { Component } from 'react';
import { ScrollObserver } from '../../../../../views/components/ScrollComponents';

class CurrentCategoryBar extends Component {
  render() {
    return (
      <ScrollObserver render={(scrollname) => {
        const category = this.getCurrentCategoryByScrollname(scrollname);
        if (!category) {
          return null;
        }
        return (
          <div className="category__current flex flex-middle flex-space-between">
            <label>{category.name}</label>
            <span className="gray-font-opacity">{category.cartQuantity} items</span>
          </div>
        );
      }} />
    );
  }

  getCurrentCategoryByScrollname = (scrollname) => {
    return (this.props.categories || []).find(category => category.name === scrollname)
  }
}

export default CurrentCategoryBar;