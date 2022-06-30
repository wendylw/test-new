import _isEmpty from 'lodash/isEmpty';
import React from 'react';
import PropTypes from 'prop-types';
import { CaretDown } from 'phosphor-react';
import { LocationAndAddressIcon } from '../../../../common/components/Icons';
import styles from './AddressDropdown.module.scss';

const AddressDropdown = ({ locationTitle, locationValue, onClick }) => (
  <div className="tw-flex-1">
    <button className={styles.addressDropdownButton} onClick={onClick}>
      <div className="tw-flex tw-items-center">
        <LocationAndAddressIcon />
        <div className="tw-flex tw-flex-col tw-text-left tw-px-4 sm:tw-px-4px">
          <span className="tw-text-sm">{locationTitle}</span>
          {_isEmpty(locationValue) ? null : (
            <span className="tw-text-xs tw-text-gray-700 tw-line-clamp-1">{locationValue}</span>
          )}
        </div>
      </div>
      <CaretDown className="tw-text-gray-600" />
    </button>
  </div>
);

AddressDropdown.displayName = 'AddressDropdown';

AddressDropdown.propTypes = {
  locationTitle: PropTypes.string,
  locationValue: PropTypes.string,
  onClick: PropTypes.func,
};

AddressDropdown.defaultProps = {
  locationTitle: null,
  locationValue: null,
  onClick: () => {},
};

export default AddressDropdown;
