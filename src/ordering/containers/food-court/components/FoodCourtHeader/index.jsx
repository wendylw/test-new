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
import { getUserIsLogin } from '../../../../redux/modules/app';
import config from '../../../../../config';
import Constants from '../../../../../utils/constants';

const FoodCourtHeader = () => {
  const { t } = useTranslation();
  const tableId = useSelector(getFoodCourtTableId);
  const isInWebview = isWebview();
  const userIsLogin = useSelector(getUserIsLogin);
  const history = useHistory();

  const goOrderHistoryPage = () => {
    if (userIsLogin) {
      window.location.href = config.beepitComUrl + Constants.ROUTER_PATHS.ORDER_HISTORY;
    } else {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
        search: window.location.search,
        state: {
          shouldGoBack: true,
          redirectLocation: config.beepitComUrl + Constants.ROUTER_PATHS.ORDER_HISTORY,
          isRedirect: true,
        },
      });
    }
  };

  const rightContentForNativeHeader = { text: t('TableIdText', { tableId }) };

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
            <span className="tw-p-16 sm:tw-p-16px tw-text-gray-700">{t('TableIdText', { tableId })}</span>
            <img onClick={goOrderHistoryPage} className={styles.OrderHistoryEntry} src={OrderHistoryEntry} alt="" />
          </div>
        </header>
      )}
    </>
  );
};

FoodCourtHeader.displayName = 'FoodCourtHeader';

export default FoodCourtHeader;
