import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './AddressLocationItem.module.scss';

const AddressLocationItem = React.memo(({ disabled, icon, title, tag, description, onSelect }) => {
  const onHandleSelectItem = useCallback(
    itemInfo => {
      onSelect(itemInfo);
    },
    [onSelect]
  );

  return (
    <button
      className={styles.addressLocationItemButton}
      disabled={disabled}
      onClick={onHandleSelectItem}
      data-test-id="ordering.address-location.item-card"
    >
      {icon}
      <div className="beep-line-clamp-flex-container tw-flex-col">
        <h4 className="tw-flex tw-items-center tw-justify-start tw-my-2 sm:tw-my-2px beep-line-clamp-flex-container">
          <span className={styles.addressLocationItemButtonTitle}>{title}</span>
          {tag}
        </h4>
        <p className={styles.addressLocationItemButtonDescription}>{description}</p>
      </div>
    </button>
  );
});

AddressLocationItem.displayName = 'AddressLocationItem';

AddressLocationItem.propTypes = {
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  title: PropTypes.string,
  tag: PropTypes.node,
  description: PropTypes.string,
  onSelect: PropTypes.func,
};

AddressLocationItem.defaultProps = {
  disabled: false,
  icon: null,
  title: '',
  tag: null,
  description: '',
  onSelect: () => {},
};

export default AddressLocationItem;
