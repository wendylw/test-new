import React, { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { IconSearch, IconClose } from './Icons';
import './PlaceSearchBox.scss';

const PlaceSearchBox = ({ onChange, onClear }) => {
  const { t } = useTranslation('OrderingDelivery');

  const [searchText, setSearchText] = useState('');

  const changeInputHandler = useCallback(event => {
    const text = event.currentTarget.value;
    setSearchText(text);
  }, []);

  const clickCloseButtonHandler = useCallback(() => {
    setSearchText('');
    onClear();
  }, [onClear]);

  useEffect(() => {
    onChange(searchText);
  }, [searchText, onChange]);

  return (
    <div className="sticky-wrapper padding-normal border__bottom-divider">
      <div className="form__group flex flex-middle flex-space-between margin-top-bottom-small">
        <IconSearch className="icon icon__big icon__default" />
        <input
          className="place-search-box__input form__input text-size-big"
          data-testid="searchAddress"
          data-heap-name="common.location-picker.search-box"
          type="text"
          placeholder={t('SearchYourAddress')}
          onChange={changeInputHandler}
          value={searchText}
        />
        <IconClose
          className="icon icon__normal icon__default"
          onClick={clickCloseButtonHandler}
          data-heap-name="common.location-picker.search-box-clear-icon"
          style={{ visibility: searchText ? 'visible' : 'hidden' }}
        />
      </div>
    </div>
  );
};

PlaceSearchBox.propTypes = {
  onChange: PropTypes.func,
  onClear: PropTypes.func,
};

PlaceSearchBox.defaultProps = {
  onChange: () => {},
  onClear: () => {},
};

PlaceSearchBox.displayName = 'PlaceSearchBox';

export default PlaceSearchBox;
