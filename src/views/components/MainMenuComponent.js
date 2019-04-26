import React, { Component } from 'react';
import { productsMergedCartType } from '../propTypes';
import { ScrollObserver } from './ScrollComponents';

class MainMenuComponent extends Component {
  static propTypes = {
    productsMergedCart: productsMergedCartType,
  }

  render() {
    const { productsMergedCart } = this.props;

    if (!productsMergedCart) {
      return null;
    }

    return (
      <div style={styles.wrapper}>
        {
          productsMergedCart.map(({ category }) => (
            <ScrollObserver key={category.id} forName={category.name}>
              <div key={category.id} style={styles.itemRow}>
                <span style={styles.itemRowLeft}>{category.name}</span>
                <small style={styles.itemRowRight}>{category.cartQuantity}</small>
              </div>
            </ScrollObserver>
          ))
        }
      </div>
    )
  }
}

const styles = {
  wrapper: {
    backgroundColor: '#f8f8f8',
  },
  itemRow: {
    paddingRight: '5px',
    paddingLeft: '5px',
    paddingTop: '3px',
    paddingBottom: '2px',
    lineHeight: '1.25em',
  },
  itemRowLeft: {
    display: 'inline-block',
    width: '80%',
  },
  itemRowRight: {
    display: 'inline-block',
    width: '20%',
    textAlign: 'right',
  },
};

export default MainMenuComponent;
