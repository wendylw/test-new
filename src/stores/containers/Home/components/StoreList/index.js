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
              className="item border__bottom-divider border-radius-base flex flex-top"
              onClick={() => {
                onSelect(id);
              }}
            >
              <div className="item__content flex flex-middle flex-space-between">
                <div className="item__detail">
                  <summary className="item__title font-weight-bolder">{name}</summary>
                  <span className="gray-font-opacity">{Utils.getValidAddress(store, ADDRESS_RANGE.CITY)}</span>
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
