import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PowerByBeepLogo from '../../../../../images/powered-by-beep-logo.svg';
import OrderHistoryEntry from '../../../../../images/order-history-entry.png';
import { getFoodCourtTableId } from '../../redux/common/selectors';
import styles from './FoodCourtHeader.module.scss';
import { isWebview } from '../../../../../common/utils';
import NativeHeader from '../../../../../components/NativeHeader';
import { closeWebView } from '../../../../../utils/native-methods';
import { getUserIsLogin, getShippingType } from '../../../../redux/modules/app';
import config from '../../../../../config';
import { PATH_NAME_MAPPING, SHIPPING_TYPES } from '../../../../../common/utils/constants';

const FoodCourtHeader = () => {
  const { t } = useTranslation();
  const tableId = useSelector(getFoodCourtTableId);
  const isInWebview = isWebview();
  const userIsLogin = useSelector(getUserIsLogin);
  const shippingType = useSelector(getShippingType);
  const history = useHistory();

  const goOrderHistoryPage = () => {
    const redirectLocation = `${config.beepitComUrl + PATH_NAME_MAPPING.ORDER_HISTORY}?source=${encodeURIComponent(
      document.location.href
    )}`;

    if (userIsLogin) {
      window.location.href = redirectLocation;
    } else {
      history.push({
        pathname: PATH_NAME_MAPPING.ORDERING_LOGIN,
        search: window.location.search,
        state: {
          shouldGoBack: true,
          isRedirect: true,
          redirectLocation,
        },
      });
    }
  };

  const tableIdOrShippingType =
    shippingType === SHIPPING_TYPES.TAKE_AWAY
      ? t('TakeAway').toUpperCase()
      : tableId
      ? t('TableIdText', { tableId })
      : null;
  const rightContentForNativeHeader = { text: tableIdOrShippingType };

  return (
    <>
      {isInWebview ? (
        <NativeHeader
          isPage
          rightContent={rightContentForNativeHeader}
          title=""
          navFunc={() => {
            closeWebView();
          }}
        />
      ) : (
        <header className="tw-flex tw-justify-between tw-items-center tw-border-0 tw-border-b tw-border-solid tw-border-gray-200">
          <h2 className={styles.FoodCourtHeaderLogoContainer}>
            <img className={styles.FoodCourtHeaderLogo} src={PowerByBeepLogo} alt="" />
          </h2>
          <div className="tw-flex tw-items-center tw-flex-shrink-0">
            {tableIdOrShippingType ? (
              <span className="tw-p-16 sm:tw-p-16px tw-text-gray-700">{tableIdOrShippingType}</span>
            ) : null}
            <img
              data-test-id="ordering.food-court.history-btn"
              onClick={goOrderHistoryPage}
              className={styles.OrderHistoryEntry}
              src={OrderHistoryEntry}
              alt=""
            />
          </div>
        </header>
      )}
    </>
  );
};

FoodCourtHeader.displayName = 'FoodCourtHeader';

export default FoodCourtHeader;
