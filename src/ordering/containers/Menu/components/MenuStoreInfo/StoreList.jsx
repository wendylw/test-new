import React, { useEffect } from 'react';
import { CaretDown } from 'phosphor-react';
import { useDispatch, useSelector } from 'react-redux';
import { getStoreDisplaySubTitle, getIsStoreListDrawerVisible } from '../../redux/common/selectors';
import { showStoreListDrawer, hideStoreInfoDrawer } from '../../redux/common/thunks';
import { getHasStoreListInitialized, getStoreList, getTotalOutletDisplayTitle } from '../../redux/stores/selectors';
import { storeDrawerShown, storeDrawerHidden, selectStoreBranch } from '../../redux/stores/thunks';
import StoreListDrawer from '../../../../components/StoreListDrawer';
import styles from './StoreList.module.scss';

const StoreList = () => {
  const dispatch = useDispatch();
  const isStoreListDrawerVisible = useSelector(getIsStoreListDrawerVisible);
  const storeList = useSelector(getStoreList);
  // the subtitle display on drawer
  const totalOutletDisplayTitle = useSelector(getTotalOutletDisplayTitle);
  // get store display sub-title, storeLocationName || storeName
  const storeDisplaySubTitle = useSelector(getStoreDisplaySubTitle);
  // if is initializing, if TRUE, show a loader
  const hasStoreListInitialized = useSelector(getHasStoreListInitialized);

  useEffect(() => {
    if (isStoreListDrawerVisible) {
      dispatch(storeDrawerShown());
    } else {
      dispatch(storeDrawerHidden());
    }
  }, [isStoreListDrawerVisible]);

  return (
    <div className="tw-flex-1">
      <button
        className={styles.storeListDropdownButton}
        disabled={storeList.length <= 1}
        onClick={() => {
          dispatch(showStoreListDrawer());
        }}
      >
        <span className={styles.storeListSubtitle}>{storeDisplaySubTitle}</span>
        {storeList.length > 1 ? <CaretDown className="tw-mx-4 sm:tw-mx-4px tw-text-xs tw-text-gray-600" /> : null}
      </button>
      <StoreListDrawer
        isInitializing={!hasStoreListInitialized}
        isStoreListDrawerVisible={isStoreListDrawerVisible}
        totalOutletDisplayTitle={totalOutletDisplayTitle}
        storeList={storeList}
        onClose={() => {
          dispatch(hideStoreInfoDrawer());
        }}
        selectStoreBranch={value => {
          dispatch(selectStoreBranch(value));
        }}
      />
    </div>
  );
};

StoreList.displayName = 'StoreList';

export default StoreList;
