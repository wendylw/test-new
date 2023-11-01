import _isEmpty from 'lodash/isEmpty';
import React, { useEffect } from 'react';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-hook-inview';
import { Star } from 'phosphor-react';
import Tag from '../../../../../common/components/Tag';
import StoreInfoDrawer from './StoreInfoDrawer';
import { ObjectFitImage } from '../../../../../common/components/Image';
import { MotorcycleIcon } from '../../../../../common/components/Icons';
import {
  getStoreLogo,
  getStoreDisplayStatus,
  getStoreDisplayTitle,
  getCashbackPercentage,
  getIsStoreInfoReady,
  getIsFreeDeliveryTagVisible,
  getDisplayDeliveryDistance,
  getFormattedShippingFee,
  getStoreRatingDisplayValue,
  getFreeShippingFormattedMinAmountWithOutSpacing,
} from '../../redux/common/selectors';
import { actions } from '../../redux/common/index';
import { STORE_STATUS_KEY_MAPPING, STORE_STATUS_COLOR_MAPPING } from './utils/constants';
import StoreList from './StoreList';
import styles from './MenuStoreInfo.module.scss';

const StoreStatusTag = ({ containerClassName, className, show, status }) => {
  const { t } = useTranslation();
  const classList = ['tw-inline-flex'];

  if (!show) {
    return null;
  }

  if (containerClassName) {
    classList.push(containerClassName);
  }

  return (
    <div className={classList.join(' ')}>
      <Tag className={className} color={STORE_STATUS_COLOR_MAPPING[status]}>
        {t(STORE_STATUS_KEY_MAPPING[status])}
      </Tag>
    </div>
  );
};
StoreStatusTag.propTypes = {
  containerClassName: propTypes.string,
  className: propTypes.string,
  show: propTypes.bool,
  status: propTypes.string,
};
StoreStatusTag.defaultProps = {
  containerClassName: null,
  className: null,
  show: false,
  status: '',
};
StoreStatusTag.displayName = 'StoreStatusTag';

const MenuStoreInfo = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // get store logo
  const storeLogo = useSelector(getStoreLogo);
  // the value might be: "" | "preOrder" | "closed"
  const storeDisplayStatus = useSelector(getStoreDisplayStatus);
  // get store display title, storeBrandName || onlineStoreName
  const storeDisplayTitle = useSelector(getStoreDisplayTitle);
  // get cashback percentage, for example: 4
  const cashbackPercentage = useSelector(getCashbackPercentage);
  // whether display FREE DELIVERY tag
  const isFreeDeliveryTagVisible = useSelector(getIsFreeDeliveryTagVisible);
  // is store info data ready, if not UI can display a loading
  const isStoreInfoReady = useSelector(getIsStoreInfoReady);
  // free shipping formatted min amount without spacing
  const freeShippingFormattedMinAmountWithoutSpacing = useSelector(getFreeShippingFormattedMinAmountWithOutSpacing);
  // the display distance: "~ 10.60 KM"
  const displayDeliveryDistance = useSelector(getDisplayDeliveryDistance);
  // formatted shipping fee: "RM 24.00",For PICK UP order will show empty string ""
  const formattedShippingFee = useSelector(getFormattedShippingFee);
  // store rating: "4.8", will be null if user enters from merchant url
  const storeRatingDisplayValue = useSelector(getStoreRatingDisplayValue);
  const displayStoreBasicInfo =
    !_isEmpty(displayDeliveryDistance) || !_isEmpty(formattedShippingFee) || storeRatingDisplayValue;

  const [storeNameRef, storeNameInView] = useInView();

  useEffect(() => {
    if (isStoreInfoReady) {
      dispatch(actions.setStoreNameInView(storeNameInView));
    }
    // do NOT add isStoreInfoReady as dependency, otherwise the storeNameInView will be set to false then back to true
    // in a short time, which will cause the native header blinks (FB-3535).
  }, [dispatch, isStoreInfoReady, storeNameInView]);

  if (!isStoreInfoReady) {
    return null;
  }

  return (
    <div className="tw-flex tw-items-center tw-px-16 sm:tw-px-16px">
      {storeLogo ? (
        <div className={`${styles.menuStoreInfo__logo} tw-relative tw-flex-shrink-0`}>
          <ObjectFitImage className="tw-rounded" src={storeLogo} />
          <StoreStatusTag
            containerClassName={styles.menuStoreInfoTag}
            show={!_isEmpty(storeDisplayStatus)}
            status={storeDisplayStatus}
          />
        </div>
      ) : null}
      <div className="tw-flex-1 tw-flex-col beep-line-clamp-flex-container">
        <h1 className="tw-flex tw-items-center tw-text-xl tw-my-0 tw-leading-normal" ref={storeNameRef}>
          {storeDisplayTitle}
          <StoreStatusTag
            className="tw-mx-8 sm:tw-mx-8px"
            show={!storeLogo && !_isEmpty(storeDisplayStatus)}
            status={storeDisplayStatus}
          />
        </h1>
        <StoreList />
        {displayStoreBasicInfo ? (
          <ul className={styles.menuStoreInfoList}>
            {storeRatingDisplayValue ? (
              <li className="tw-flex tw-items-center">
                <Star className={styles.menuStoreInfoStarIcon} weight="fill" />
                <span className="tw-ml-4 sm:tw-ml-4px tw-text-xs">{storeRatingDisplayValue}</span>
              </li>
            ) : null}
            {/* Because of the inconsistent in route distance between homepage and store list, we have decided to hide the distance display on menu page until further notice */}
            {/* {displayDeliveryDistance ? (
              <li className="tw-flex tw-items-center">
                <MapPin weight="light" className="tw-text-gray-600" />
                <span className="tw-ml-4 sm:tw-ml-4px tw-text-xs">{displayDeliveryDistance}</span>
              </li>
            ) : null} */}
            {formattedShippingFee ? (
              <li className="tw-flex tw-items-center">
                <MotorcycleIcon className="tw-text-xs tw-text-gray-600" />
                <span className="tw-ml-4 sm:tw-ml-4px tw-text-xs">{formattedShippingFee}</span>
              </li>
            ) : null}
          </ul>
        ) : null}
        {cashbackPercentage || isFreeDeliveryTagVisible ? (
          <ol className="tw-flex tw-items-center tw--mx-4 sm:tw--mx-4px tw-whitespace-nowrap">
            {cashbackPercentage ? (
              <li className="tw-inline-block tw-mx-4 sm:tw-mx-4px tw-my-4 sm:tw-my-4px beep-text-reset">
                <Tag className="tw-leading-loose" color="pink" radiusSize="xs">
                  {t('StoreCashbackPercentage', { cashbackPercentage })}
                </Tag>
              </li>
            ) : null}
            {isFreeDeliveryTagVisible ? (
              <li className={`${styles.menuStoreInfoFreeDeliveryTagContainer} beep-text-reset`}>
                <Tag className={`${styles.menuStoreInfoFreeDeliveryTag}`} color="pink" radiusSize="xs">
                  {t('FreeDeliveryPrompt', {
                    freeShippingFormattedMinAmount: freeShippingFormattedMinAmountWithoutSpacing,
                  })}
                </Tag>
              </li>
            ) : null}
          </ol>
        ) : null}
      </div>
      <StoreInfoDrawer />
    </div>
  );
};

MenuStoreInfo.displayName = 'MenuStoreInfo';

export default MenuStoreInfo;
