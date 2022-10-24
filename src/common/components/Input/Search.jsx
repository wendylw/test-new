import _isEmpty from 'lodash/isEmpty';
import React, { useCallback, useRef, useState } from 'react';
import { useMount } from 'react-use';
import PropTypes from 'prop-types';
import { MagnifyingGlass, XCircle } from 'phosphor-react';
import Button from '../Button';
import Loader from '../Loader';
import styles from './Search.module.scss';

const Search = React.forwardRef(
  (
    {
      addOnIcon,
      className,
      placeholder,
      defaultSearchKeyword,
      allowClear,
      searching,
      onChangeInputValue,
      onClearInput,
    },
    searchRef
  ) => {
    const classNameList = [styles.SearchContainer, allowClear ? '' : 'not-allow-clear'];
    // Search input value use state of component, because Chinese typing
    const [inputValue, setInputValue] = useState(defaultSearchKeyword);
    const currentRef = useRef(null);
    const searchInputRef = searchRef || currentRef;
    const onHandleClearSearchKeyword = useCallback(async () => {
      setInputValue('');

      await onClearInput();

      searchInputRef.current?.focus();
    });

    // TODO: move this useEffect to reference component
    useMount(() => {
      searchInputRef.current?.focus();
    });

    if (className) {
      classNameList.push(className);
    }

    return (
      <div className={classNameList.join(' ')}>
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

        {searching ? (
          <Loader className="tw-text-2xl tw-text-gray-500" weight="light" />
        ) : (
          <>
            {allowClear ? (
              <Button
                type="text"
                className={_isEmpty(inputValue) ? 'tw-opacity-0' : 'tw-flex-shrink-0'}
                contentClassName="beep-text-reset"
                disabled={_isEmpty(inputValue)}
                onClick={onHandleClearSearchKeyword}
              >
                <XCircle className="tw-text-2xl tw-text-gray-500" weight="fill" />
              </Button>
            ) : null}
          </>
        )}
      </div>
    );
  }
);

Search.displayName = 'Search';

Search.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  addOnIcon: PropTypes.node,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  defaultSearchKeyword: PropTypes.string,
  allowClear: PropTypes.bool,
  searching: PropTypes.bool,
  onChangeInputValue: PropTypes.func,
  onClearInput: PropTypes.func,
};
Search.defaultProps = {
  addOnIcon: null,
  className: null,
  placeholder: '',
  defaultSearchKeyword: '',
  allowClear: true,
  searching: false,
  onChangeInputValue: () => {},
  onClearInput: () => {},
};

export default Search;
