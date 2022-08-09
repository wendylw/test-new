import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Tag from '../../../common/components/Tag';
import { FlagIcon } from '../../../common/components/Icons';
import styles from './AddressList.module.scss';

const AddressList = React.memo(({ addressList, onSelectAddress }) => {
  const { t } = useTranslation();

  return (
    <ul>
      {addressList.map(address => (
        <li key={address.id} className={styles.addressItem}>
          <button
            className={styles.addressItemButton}
            disabled={address.outOfRange}
            onClick={() => onSelectAddress(address)}
          >
            <FlagIcon className="tw-flex-shrink-0 tw-my-4 sm:tw-my-4px" />
            <div className="beep-line-clamp-flex-container tw-flex-col">
              <h4 className="tw-flex tw-items-center tw-justify-start tw-my-2 sm:tw-my-2px beep-line-clamp-flex-container">
                <span className={styles.addressItemButtonTitle}>{address.addressName}</span>
                {address.outOfRange ? <Tag className="tw-flex-shrink-0 tw-font-bold">{t('OutOfRange')}</Tag> : null}
              </h4>
              <p className={styles.addressItemButtonDeliveryTo}>{address.deliveryTo}</p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
});

AddressList.displayName = 'AddressList';

AddressList.propTypes = {
  addressList: PropTypes.arrayOf(PropTypes.object),
  onSelectAddress: PropTypes.func,
};

AddressList.defaultProps = {
  addressList: [],
  onSelectAddress: () => {},
};

export default AddressList;
