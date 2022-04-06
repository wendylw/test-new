import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-hook-inview';
import { ObjectFitImage } from '../../../../../common/components/Image';
import {
  getStoreLogo,
  getStoreDisplayTitle,
  getStoreDisplaySubTitle,
  getCashbackPercentage,
  getIsStoreInfoReady,
} from '../../redux/common/selectors';
import { actions } from '../../redux/common/index';
import styles from './MenuStoreInfo.module.scss';

const MenuStoreInfo = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // get store logo
  const storeLogo = useSelector(getStoreLogo);
  // get store display title, storeBrandName || onlineStoreName
  const storeDisplayTitle = useSelector(getStoreDisplayTitle);
  // get store display sub-title, storeLocationName || storeName
  const storeDisplaySubTitle = useSelector(getStoreDisplaySubTitle);
  // get cashback percentage, for example: 4
  const cashbackPercentage = useSelector(getCashbackPercentage);
  // is store info data ready, if not UI can display a loading
  const isStoreInfoReady = useSelector(getIsStoreInfoReady);

  const [storeNameRef, storeNameInView] = useInView();

  useEffect(() => {
    if (isStoreInfoReady) {
      dispatch(actions.setStoreNameInView(storeNameInView));
    }
    // do NOT add isStoreInfoReady as dependency, otherwise the storeNameInView will be set to false then back to true
    // in a short time, which will cause the native header blinks (FB-3535).
  }, [dispatch, storeNameInView]);

  if (!isStoreInfoReady) {
    return null;
  }

  return (
    <div className="tw-flex tw-items-center tw-px-16 sm:tw-px-16px">
      {storeLogo ? (
        <div className={`${styles.menuStoreInfo__logo} tw-flex-shrink-0`}>
          <ObjectFitImage className="tw-rounded" src={storeLogo} />
        </div>
      ) : null}
      <div className="tw-mx-12 sm:tw-mx-12px">
        <h1 className="tw-text-xl tw-my-0 tw-leading-normal" ref={storeNameRef}>
          {storeDisplayTitle}
        </h1>
        <p className="tw-text-sm tw-leading-loose">{storeDisplaySubTitle}</p>
        {cashbackPercentage ? (
          <ol className="tw--mx-2 sm:tw--mx-2px">
            <li
              className={`${styles.menuStoreInfo__tag} tw-inline-block tw-px-4 sm:tw-px-4px tw-mx-2 sm:tw-mx-2px tw-my-4 sm:tw-my-4px text-size-reset`}
            >
              <span className="tw-text-xs tw-leading-loose">
                {t('StoreCashbackPercentage', { cashbackPercentage })}
              </span>
            </li>
          </ol>
        ) : null}
      </div>
    </div>
  );
};

MenuStoreInfo.displayName = 'MenuStoreInfo';

export default MenuStoreInfo;
