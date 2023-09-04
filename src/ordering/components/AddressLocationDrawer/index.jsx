import _debounce from 'lodash/debounce';
import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X } from 'phosphor-react';
import Drawer from '../../../common/components/Drawer';
import DrawerHeader from '../../../common/components/Drawer/DrawerHeader';
import Search from '../../../common/components/Input/Search';
import styles from './AddressLocationDrawer.module.scss';

const searchUpdateDebounce = _debounce((value, callback) => callback(value), 700);
const AddressLocationDrawer = ({
  children,
  isLocationDrawerVisible,
  onClose,
  onChangeSearchKeyword,
  onClearSearchKeyword,
}) => {
  const { t } = useTranslation();
  const searchInputRef = useRef(null);
  const onHandleShownDrawer = useCallback(() => {
    // Only trigger focus animation shows the drawer, otherwise, drawer slide-up animation will drop frames or miss frames, which looks very stuck.
    searchInputRef.current?.focus();
  }, []);
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
      className={styles.addressLocationDrawer}
      show={isLocationDrawerVisible}
      header={
        <DrawerHeader
          className={styles.addressLocationDrawerHeader}
          left={
            <X
              weight="light"
              className="tw-flex-shrink-0 tw-text-2xl tw-text-gray"
              onClick={onClose}
              data-test-id="ordering.address-location-drawer.close-btn"
            />
          }
        >
          <span className="tw-font-bold tw-text-lg tw-leading-relaxed">{t('DeliverTo')}</span>
        </DrawerHeader>
      }
      onShown={onHandleShownDrawer}
      onClose={onHandleCloseDrawer}
    >
      <div className={styles.addressLocationDrawerContent}>
        <section className="tw-flex-shrink-0 tw-pb-16 sm:tw-pb-16px tw-px-16 sm:tw-px-16px tw-border-0 tw-border-b tw-border-solid tw-border-gray-200">
          <Search
            isDebounce
            ref={searchInputRef}
            placeholder={t('SearchYourLocation')}
            searching={false}
            onChangeInputValue={onHandleChangeSearchKeyword}
            onClearInput={onHandleClearSearchKeyword}
          />
        </section>
        {children}
      </div>
    </Drawer>
  );
};

AddressLocationDrawer.displayName = 'AddressLocationDrawer';

AddressLocationDrawer.propTypes = {
  children: PropTypes.node,
  isLocationDrawerVisible: PropTypes.bool,
  onChangeSearchKeyword: PropTypes.func,
  onClearSearchKeyword: PropTypes.func,
  onClose: PropTypes.func,
};

AddressLocationDrawer.defaultProps = {
  children: null,
  isLocationDrawerVisible: true,
  onChangeSearchKeyword: () => {},
  onClearSearchKeyword: () => {},
  onClose: () => {},
};

export default AddressLocationDrawer;
