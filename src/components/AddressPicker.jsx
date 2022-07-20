/* eslint-disable react/forbid-prop-types */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { IconBookmark, IconNext } from './Icons';
import Tag from './Tag';
import { ADDRESS_DISPLAY_MODES } from '../ordering/redux/modules/addressList/constants';
import './AddressPicker.scss';

const AddressPicker = ({ addressList, onSelect, displayMode }) => {
  const { t } = useTranslation();
  const shouldShowDetail = useMemo(() => displayMode === ADDRESS_DISPLAY_MODES.FULL, [displayMode]);

  return (
    <div>
      <p className="address-picker__title padding-normal text-weight-bolder">{t('SavedAddress')}</p>
      {addressList.map((address, index) => {
        const { _id: id, availableStatus = true, addressName, addressDetails, comments, deliveryTo } = address;

        return (
          <div
            className={`flex flex-space-between margin-left-right-normal border__bottom-divider ${
              availableStatus ? 'active' : 'address-card__disabled'
            }`}
            key={id}
            role="button"
            tabIndex={index}
            onClick={() => (availableStatus ? onSelect(address, index) : null)}
          >
            <div className="margin-top-bottom-normal">
              <IconBookmark className={`icon address-card__book-mark ${availableStatus ? '' : 'icon__default'}`} />
            </div>
            <div className="address-card__delivery-info margin-normal">
              <div>
                <div>
                  <span>{addressName}</span>
                  {!availableStatus && (
                    <Tag
                      text={t('OutOfRange')}
                      className="tag__primary tag__small margin-left-right-normal text-uppercase"
                    />
                  )}
                </div>
                <p className="padding-top-bottom-small text-opacity">{deliveryTo}</p>
              </div>
              {shouldShowDetail && (
                <div className="padding-top-bottom-small text-line-height-base">
                  <div>{addressDetails}</div>
                  <div>{comments}</div>
                </div>
              )}
            </div>
            <div className="flex flex-middle">
              <IconNext className={`icon ${availableStatus ? '' : 'icon__default'} icon__small `} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

AddressPicker.propTypes = {
  displayMode: PropTypes.string,
  addressList: PropTypes.array,
  onSelect: PropTypes.func,
};

AddressPicker.defaultProps = {
  displayMode: ADDRESS_DISPLAY_MODES.PARTIAL,
  addressList: [],
  onSelect: () => {},
};

AddressPicker.displayName = 'AddressPicker';

export default AddressPicker;
