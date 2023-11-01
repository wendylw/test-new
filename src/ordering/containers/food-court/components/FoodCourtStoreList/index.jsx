import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ObjectFitImage } from '../../../../../common/components/Image';
import { getFoodCourtStoreList } from '../../redux/common/selectors';
import { selectedOneStore } from '../../redux/common/thunks';
import styles from './FoodCourtStoreList.module.scss';

const FoodCourtStoreList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const storeList = useSelector(getFoodCourtStoreList);

  return (
    <div className="tw-pb-16 sm:tw-pb-16px tw-relative">
      <div className="tw-absolute tw-w-0 tw-h-0 tw-left-0 tw-pointer-events-none" />
      <h2 className="tw-text-xl tw-font-bold tw-mx-16 sm:tw-mx-16px tw-my-8 sm:tw-my-8px tw-leading-normal">
        {t('Restaurants')}
      </h2>
      <ul className={styles.foodCourtStoreList}>
        {storeList.map(store =>
          !store.imageNoCompression && !store.image ? null : (
            <li
              key={`bestSellerProductItem-${store.id}`}
              className={store.isClosed ? styles.foodCourtStoreClosed : styles.foodCourtStore}
              data-test-id="ordering.food-court.store-item"
              onClick={() => {
                if (!store.unavailable) {
                  dispatch(selectedOneStore({ businessName: store.businessName, redirectUrl: store.redirectUrl }));
                }
              }}
            >
              <div className="tw-relative tw-p-4 sm:tw-p-4px">
                <div className={styles.foodCourtStoreImageContainer}>
                  <ObjectFitImage
                    className="tw-rounded"
                    src={store.imageNoCompression || store.image}
                    noCompression={!!store.imageNoCompression}
                  />
                  {store.isClosed ? (
                    <div className={styles.foodCourtStoreClosedOverlay}>
                      <span className={styles.foodCourtStoreClosedOverlayText}>{t('ClosedForNow')}</span>
                    </div>
                  ) : null}
                </div>
                <h4
                  className={`${styles.foodCourtStoreTitle} tw-px-2 sm:tw-px-2px tw-mt-8 sm:tw-mt-8px tw-font-bold tw-leading-relaxed`}
                >
                  {store.title}
                </h4>
                <div
                  className={`${styles.foodCourtStoreDescription} tw-flex tw-flex-wrap tw-items-center tw-px-2 sm:tw-px-2px tw-my-4 sm:tw-my-4px`}
                >
                  <span className={styles.foodCourtStoreTag}>{store.tags.join(', ')}</span>
                </div>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
};

FoodCourtStoreList.displayName = 'FoodCourtStoreList';

export default FoodCourtStoreList;
