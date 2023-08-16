import React from 'react';
import PropTypes from 'prop-types';
import Utils from '../../../../../utils/utils';
import Constants from '../../../../../utils/constants';

const StoreList = ({ storeList, onSelect }) => (
  <ul>
    {storeList.map(store => {
      const { id, name } = store;
      const { ADDRESS_RANGE } = Constants;

      return (
        <li
          key={id}
          className="padding-top-bottom-small padding-left-right-normal"
          data-testid="store"
          data-test-id="stores.home.store-item"
          onClick={() => {
            onSelect(id);
          }}
        >
          <div className="card margin-top-bottom-smaller margin-left-right-small flex flex-middle flex-space-between padding-normal border-radius-large">
            <summary className="margin-top-bottom-small">
              <h4 className="margin-top-bottom-smaller text-size-big text-weight-bolder">{name}</h4>
              <p className="margin-top-bottom-smaller text-opacity">
                {Utils.getValidAddress(store, ADDRESS_RANGE.CITY)}
              </p>
            </summary>
          </div>
        </li>
      );
    })}
  </ul>
);

StoreList.displayName = 'StoreList';

StoreList.propTypes = {
  storeList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  onSelect: PropTypes.func,
};

StoreList.defaultProps = {
  storeList: [],
  onSelect: () => {},
};

export default StoreList;
