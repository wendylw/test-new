import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Utils from '../../../../../utils/utils';
import Constants from '../../../../../utils/constants';

class StoreList extends Component {
  render() {
    const { storeList, onSelect } = this.props;

    return (
      <ul className="list">
        {storeList.map(store => {
          const { id, name } = store;
          const { ADDRESS_RANGE } = Constants;

          return (
            <li
              key={id}
              className="padding-small border-radius-base"
              data-testid="store"
              data-heap-name="stores.home.store-item"
              data-heap-store-name={name}
              onClick={() => {
                onSelect(id);
              }}
            >
              <div className="card margin-small flex flex-middle flex-space-between">
                <div className="">
                  <summary className="text-weight-bolder">{name}</summary>
                  <span className="text-opacity">{Utils.getValidAddress(store, ADDRESS_RANGE.CITY)}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }
}

StoreList.propTypes = {
  storeList: PropTypes.array,
  onSelect: PropTypes.func,
};

StoreList.defaultProps = {
  storeList: [],
  onSelect: () => {},
};

export default StoreList;
