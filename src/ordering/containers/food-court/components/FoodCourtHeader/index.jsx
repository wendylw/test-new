import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PowerByBeepLogo from '../../../../../images/powered-by-beep-logo.svg';
import { getFoodCourtTableId } from '../../redux/common/selectors';
import styles from './FoodCourtHeader.module.scss';
import { isWebview } from '../../../../../common/utils';
import NativeHeader from '../../../../../components/NativeHeader';
import { closeWebView } from '../../../../../utils/native-methods';

const FoodCourtHeader = () => {
  const { t } = useTranslation();
  const tableId = useSelector(getFoodCourtTableId);
  const isInWebview = isWebview();
  const createRightContentHtml = useCallback(
    content => (
      <div className="tw-flex-shrink-0">
        <span className="tw-p-16 sm:tw-p-16px tw-text-gray-700">{content}</span>
      </div>
    ),
    []
  );
  const rightContentForNativeHeader = { text: t('TableIdText', { tableId }) };
  const rightContentForWebHeader = createRightContentHtml(t('TableIdText', { tableId }));

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
          {rightContentForWebHeader}
        </header>
      )}
    </>
  );
};

FoodCourtHeader.displayName = 'FoodCourtHeader';

export default FoodCourtHeader;
