import React, { useCallback, useEffect } from 'react';
import { CaretDown } from 'phosphor-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  getStoreDisplaySubTitle,
  getIsStoreListDrawerVisible,
  getIsQrOrderingShippingType,
} from '../../redux/common/selectors';
import { storeListDrawerOpened, storeListDrawerClosed } from '../../redux/common/thunks';
import { getHasStoreListInitialized, getStoreList, getTotalOutlet } from '../../redux/stores/selectors';
import { storeDrawerShown, storeDrawerHidden, storeBranchSelected } from '../../redux/stores/thunks';
import StoreListDrawer from '../../../../components/StoreListDrawer';
import styles from './StoreList.module.scss';

const StoreList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isQrOrderingShippingType = useSelector(getIsQrOrderingShippingType);
  const isStoreListDrawerVisible = useSelector(getIsStoreListDrawerVisible);
  const storeList = useSelector(getStoreList);
  // the subtitle display on drawer
  const totalOutlet = useSelector(getTotalOutlet);
  // get store display sub-title, storeLocationName || storeName
  const storeDisplaySubTitle = useSelector(getStoreDisplaySubTitle);
  // if is initializing, if TRUE, show a loader
  const hasStoreListInitialized = useSelector(getHasStoreListInitialized);
  const onHandleCloseStoreListDrawer = useCallback(() => {
    dispatch(storeListDrawerClosed());
  }, [dispatch]);

  useEffect(() => {
    if (isStoreListDrawerVisible) {
      dispatch(storeDrawerShown());
    } else {
      dispatch(storeDrawerHidden());
    }
  }, [dispatch, isStoreListDrawerVisible]);

  return (
    <div className="tw-flex-1 beep-line-clamp-flex-container">
      {isQrOrderingShippingType ? (
        <p className={styles.storeListSubtitle}>{storeDisplaySubTitle}</p>
      ) : (
        <>
          <button
            className={styles.storeListDropdownButton}
            onClick={() => {
              dispatch(storeListDrawerOpened());
            }}
          >
            <span className={styles.storeListSubtitle}>{storeDisplaySubTitle}</span>
            <CaretDown className="tw-mx-4 sm:tw-mx-4px tw-text-xs tw-text-gray-600" />
          </button>
          <StoreListDrawer
            isInitializing={!hasStoreListInitialized}
            isStoreListDrawerVisible={isStoreListDrawerVisible}
            totalOutletDisplayTitle={t('StoreListDrawerDescription', { totalOutlet })}
            storeList={storeList}
            onClose={onHandleCloseStoreListDrawer}
            selectStoreBranch={id => {
              dispatch(storeBranchSelected(id));
            }}
          />
        </>
      )}
    </div>
  );
};

StoreList.displayName = 'StoreList';

export default StoreList;
