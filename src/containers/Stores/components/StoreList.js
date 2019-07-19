import React, { Component } from 'react';
import Utils from '../../../libs/utils';
import Constants from '../../../Constants';

class StoreList extends Component {
  componentDidMount() {
    const { data: stores, onSelect } = this.props;

    // auto redirect when there only one store in the list
    if (stores.length === 1) {
      onSelect(stores[0].id);
    }
  }

  render() {
    const { data } = this.props;

    return (
      <ul className="list">
        {
          data.map(store => {
            const {
              id,
              name,
              isDeleted,
            } = store;
            const { ADDRESS_RANGE } = Constants;

            if (isDeleted) {
              return null;
            }

            return (
              <li
                key={id}
                className="item border__bottom-divider border-radius-base flex flex-top"
                onClick={() => {
                  this.handleStoreClick(id);
                }}
              >
                <div className="item__content flex flex-middle flex-space-between">
                  <div className="item__detail">
                    <summary className="item__title font-weight-bold">{name}</summary>
                    <span className="gray-font-opacity">
                      {Utils.getValidAddress(store, ADDRESS_RANGE.CITY)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })
        }
      </ul>
    );
  }

  handleStoreClick = (storeId) => {
    this.props.onSelect(storeId);
  }
}

export default StoreList;