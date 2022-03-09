import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PowerByBeepLogo from '../../../../../images/powered-by-beep-logo.svg';
import { getTableId, getShouldShowStoreNameInNativeHeader, getStoreDisplayTitle } from '../../redux/common/selectors';
import { getIsProductDetailDrawerVisible } from '../../redux/productDetail/selectors';
import { hideProductDetailDrawer } from '../../redux/productDetail/thunks';
import styles from './MenuHeader.module.scss';
import { isWebview, isDineInType, isTakeAwayType } from '../../../../../common/utils';
import NativeHeader from '../../../../../components/NativeHeader';
import { closeWebView } from '../../../../../utils/native-methods';

const MenuHeader = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const tableId = useSelector(getTableId);
  const showStoreName = useSelector(getShouldShowStoreNameInNativeHeader);
  const storeDisplayTitle = useSelector(getStoreDisplayTitle);
  const isProductDetailDrawerVisible = useSelector(getIsProductDetailDrawerVisible);
  const isInWebview = isWebview();
  const createRightContentHtml = useCallback(
    content => (
      <div className="tw-flex-shrink-0">
        <span className="tw-p-16 sm:tw-p-16px tw-text-gray-700">{content}</span>
      </div>
    ),
    []
  );
  let rightContentForNativeHeader = null;
  let rightContentForWebHeader = null;
  if (isDineInType()) {
    if (tableId) {
      rightContentForNativeHeader = { text: t('TableIdText', { tableId }) };
      rightContentForWebHeader = createRightContentHtml(t('TableIdText', { tableId }));
    }
  } else if (isTakeAwayType()) {
    rightContentForNativeHeader = { text: t('TAKE_AWAY') };
    rightContentForWebHeader = createRightContentHtml(t('TAKE_AWAY'));
  }

  return (
    <>
      {isInWebview ? (
        <NativeHeader
          isPage
          rightContent={rightContentForNativeHeader}
          title={showStoreName ? storeDisplayTitle : ''}
          navFunc={() => {
            if (isProductDetailDrawerVisible) {
              dispatch(hideProductDetailDrawer(false));
            } else {
              closeWebView();
            }
          }}
        />
      ) : (
        <header className="tw-flex tw-justify-between tw-items-center tw-border-0 tw-border-b tw-border-solid tw-border-gray-200">
          <h2 className={styles.MenuHeaderLogoContainer}>
            <img className={styles.MenuHeaderLogo} src={PowerByBeepLogo} alt="" />
          </h2>
          {rightContentForWebHeader}
        </header>
      )}
    </>
  );
};

MenuHeader.displayName = 'MenuHeader';

export default MenuHeader;
