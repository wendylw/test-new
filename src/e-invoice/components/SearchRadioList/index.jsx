import _isEmpty from 'lodash/isEmpty';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLifecycles } from 'react-use';
import { getClassName } from '../../../common/utils/ui';
import Search from '../../../common/components/Input/Search';
import Radio from '../../../common/components/Radio';
import styles from './SearchRadioList.module.scss';

const SearchRadioList = ({ searchInputPlaceholder, focusDelay, name, options, showRadio, onChangeRadioSelected }) => {
  const searchInputRef = useRef(null);
  const focusTimeoutId = useRef(null);
  const [keyword, setKeyword] = useState(null);
  const [searchedOptions, setSearchedOptions] = useState([]);
  const handleChangeSearchInputValue = useCallback(value => {
    setKeyword(value);
  }, []);
  const handleClearSearchInputValue = useCallback(() => {
    setKeyword(null);
  }, []);
  const handleSelectedRadio = useCallback(
    option => {
      onChangeRadioSelected(option);
    },
    [onChangeRadioSelected]
  );

  useEffect(() => {
    if (!_isEmpty(keyword)) {
      const filteredOptions = options.filter(option => option?.name.toLowerCase().includes(keyword.toLowerCase()));

      setSearchedOptions(filteredOptions);
    }
  }, [keyword, options]);

  useLifecycles(
    () => {
      focusTimeoutId.current = setTimeout(() => {
        searchInputRef.current?.focus();
      }, focusDelay);
    },
    () => {
      clearTimeout(focusTimeoutId.current);
    }
  );

  return (
    <>
      <div className={styles.SearchRadioListSearchInputContainer}>
        <Search
          allowClear
          ref={searchInputRef}
          placeholder={searchInputPlaceholder}
          onChangeInputValue={handleChangeSearchInputValue}
          onClearInput={handleClearSearchInputValue}
        />
      </div>
      <div>
        <Radio.Group name={name}>
          {(keyword ? searchedOptions : options).map(option => (
            <Radio
              key={option.id}
              checked={option.selected}
              value={option.id}
              containerClassName={styles.SearchRadioListRadioContainer}
              className={getClassName([styles.SearchRadioListRadio, showRadio ? '' : styles.SearchRadioListRadioHide])}
              data-test-id="eInvoice.common.search-radio-list.radio"
              onChange={() => {
                handleSelectedRadio(option);
              }}
            >
              <span className={styles.SearchRadioItemLabel}>{option.name}</span>
            </Radio>
          ))}
        </Radio.Group>
      </div>
    </>
  );
};

SearchRadioList.displayName = 'SearchRadioList';

SearchRadioList.propTypes = {
  searchInputPlaceholder: PropTypes.string,
  focusDelay: PropTypes.number,
  name: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  options: PropTypes.array,
  showRadio: PropTypes.bool,
  onChangeRadioSelected: PropTypes.func,
};

SearchRadioList.defaultProps = {
  searchInputPlaceholder: '',
  focusDelay: 0,
  name: null,
  options: [],
  showRadio: false,
  onChangeRadioSelected: () => {},
};

export default SearchRadioList;
