import _debounce from 'lodash/debounce';
import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X } from 'phosphor-react';
import Drawer from '../../../common/components/Drawer';
import DrawerHeader from '../../../common/components/Drawer/DrawerHeader';
import Search from '../../../common/components/Input/Search';
import Loader from '../../../common/components/Loader';
import styles from './AddressLocationDrawer.module.scss';

const searchUpdateDebounce = _debounce((value, callback) => callback(value), 700);
const AddressLocationDrawer = ({
  children,
  isLocationDrawerVisible,
  isInitializing,
  isEmptyList,
  onClose,
  onChangeSearchKeyword,
  onClearSearchKeyword,
}) => {
  const { t } = useTranslation();
  const searchInputRef = useRef(null);
  const onHandleCloseDrawer = useCallback(() => {
    onClose();
  }, [onClose]);
  const onHandleChangeSearchKeyword = useCallback(
    searchKeyword => {
      searchUpdateDebounce(searchKeyword, onChangeSearchKeyword);
    },
    [onChangeSearchKeyword]
  );
  const onHandleClearSearchKeyword = useCallback(() => {
    onClearSearchKeyword();
  }, [onClearSearchKeyword]);

  return (
    <Drawer
      fullScreen
      className={`${isInitializing ? styles.addressDropdownDrawerInitializing : styles.addressLocationDrawer}${
        isEmptyList ? ` ${styles.addressLocationDrawerEmpty}` : ''
      }`}
      show={isLocationDrawerVisible}
      header={
        <DrawerHeader
          className={styles.addressLocationDrawerHeader}
          left={<X weight="light" className="tw-flex-shrink-0 tw-text-2xl tw-text-gray" onClick={onClose} />}
        >
          <span className="tw-font-bold tw-text-lg tw-leading-relaxed">{t('DeliverTo')}</span>
        </DrawerHeader>
      }
      onClose={onHandleCloseDrawer}
    >
      {isInitializing ? (
        <Loader className={styles.loader} weight="bold" />
      ) : (
        <div className={styles.addressLocationDrawerContent}>
          <section className="tw-flex-shrink-0 tw-pb-16 sm:tw-pb-16px tw-px-16 sm:tw-px-16px tw-border-0 tw-border-b tw-border-solid tw-border-gray-200">
            <Search
              isDebounce
              ref={searchInputRef}
              placeholder={t('SearchYourLocation')}
              searching={false}
              backgroundColor="gray"
              onChangeInputValue={onHandleChangeSearchKeyword}
              onClearInput={onHandleClearSearchKeyword}
            />
          </section>
          {children}
        </div>
      )}
    </Drawer>
  );
};

AddressLocationDrawer.displayName = 'AddressLocationDrawer';

AddressLocationDrawer.propTypes = {
  children: PropTypes.node,
  isInitializing: PropTypes.bool,
  isLocationDrawerVisible: PropTypes.bool,
  isEmptyList: PropTypes.bool,
  onChangeSearchKeyword: PropTypes.func,
  onClearSearchKeyword: PropTypes.func,
  onClose: PropTypes.func,
};

AddressLocationDrawer.defaultProps = {
  children: null,
  isInitializing: false,
  isLocationDrawerVisible: true,
  isEmptyList: false,
  onChangeSearchKeyword: () => {},
  onClearSearchKeyword: () => {},
  onClose: () => {},
};

export default AddressLocationDrawer;
