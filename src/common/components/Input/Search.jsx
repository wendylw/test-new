import React, { useRef, useState } from 'react';
import { useMount } from 'react-use';
import PropTypes from 'prop-types';
import { MagnifyingGlass, XCircle } from 'phosphor-react';
import Button from '../Button';
import styles from './Search.module.scss';

const Search = React.forwardRef(
  ({ addOnIcon, placeholder, defaultSearchKeyword, allowClear, onChangeInputValue, onClearInput }, searchRef) => {
    // Search input value use state of component, because Chinese typing
    const [inputValue, setInputValue] = useState(defaultSearchKeyword);
    const currentRef = useRef(null);
    const searchInputRef = searchRef || currentRef;
    useMount(() => {
      searchInputRef.current?.focus();
    });

    return (
      <div className="tw-flex tw-flex-1 tw-items-center tw-border tw-border-solid tw-border-gray-400 tw-rounded-2xl">
        {addOnIcon || (
          <i className="tw-inline-flex tw-p-8 sm:tw-p-8px tw-inline-flex tw-p-8 sm:tw-p-8px tw-mx-2 sm:tw-mx-2px">
            <MagnifyingGlass weight="light" className="tw-flex-shrink-0 tw-text-2xl tw-text-black" />
          </i>
        )}
        <input
          ref={ref => {
            searchInputRef.current = ref;
          }}
          placeholder={placeholder}
          className="tw-flex-1 tw-border-0 tw-leading-relaxed tw-text-gray tw-placeholder-gray-500"
          type="text"
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            onChangeInputValue(e.target.value);
          }}
          onKeyPress={e => {
            if (e.code === 'Enter' || (e.charCode || e.which) === 13) {
              searchInputRef.current?.blur();
            }
          }}
        />
        {allowClear ? (
          <Button
            type="text"
            className={styles.SearchClearButton}
            onClick={async () => {
              setInputValue('');

              await onClearInput();

              searchInputRef.current?.focus();
            }}
          >
            <XCircle className="tw-text-2xl tw-text-black tw-text-gray-500" weight="fill" />
          </Button>
        ) : null}
      </div>
    );
  }
);

Search.displayName = 'Search';

Search.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  addOnIcon: PropTypes.node,
  placeholder: PropTypes.string,
  defaultSearchKeyword: PropTypes.string,
  allowClear: PropTypes.bool,
  onChangeInputValue: PropTypes.func,
  onClearInput: PropTypes.func,
};
Search.defaultProps = {
  addOnIcon: null,
  placeholder: '',
  defaultSearchKeyword: '',
  allowClear: true,
  onChangeInputValue: () => {},
  onClearInput: () => {},
};

export default Search;
