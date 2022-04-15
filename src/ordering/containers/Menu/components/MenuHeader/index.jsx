import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PowerByBeepLogo from '../../../../../images/powered-by-beep-logo.svg';
import ArrowBackIcon from '../../../../../images/arrow-icon.svg';
import { getTableId, getShouldShowStoreNameInNativeHeader, getStoreDisplayTitle } from '../../redux/common/selectors';
import { getIsProductDetailDrawerVisible } from '../../redux/productDetail/selectors';
import { hideProductDetailDrawer } from '../../redux/productDetail/thunks';
import styles from './MenuHeader.module.scss';
import { isWebview, isDineInType, isTakeAwayType, getSourceUrlFromSessionStorage } from '../../../../../common/utils';
import Utils from '../../../../../utils/utils';
import NativeHeader from '../../../../../components/NativeHeader';
import { closeWebView, goBack } from '../../../../../utils/native-methods';
import { getDeliveryInfo } from '../../../../redux/modules/app';

const MenuHeader = ({ webHeaderVisibility }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const tableId = useSelector(getTableId);
  const showStoreName = useSelector(getShouldShowStoreNameInNativeHeader);
  const storeDisplayTitle = useSelector(getStoreDisplayTitle);
  const isProductDetailDrawerVisible = useSelector(getIsProductDetailDrawerVisible);
  const isInWebview = isWebview();
  const { enableLiveOnline } = useSelector(getDeliveryInfo);
  const history = useHistory();
  const ifShouldShowHeader = isWebview() || Utils.isFromBeepSite();
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
  const webHeader = webHeaderVisibility ? (
    <header className="tw-flex tw-justify-between tw-items-center tw-border-0 tw-border-b tw-border-solid tw-border-gray-200">
      <h2 className={styles.MenuHeaderLogoContainer}>
        <img className={styles.MenuHeaderLogo} src={PowerByBeepLogo} alt="" />
      </h2>
      {rightContentForWebHeader}
    </header>
  ) : null;

  const renderNormalContent = () => (
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
        webHeader
      )}
    </>
  );

  const handleNavBack = () => {
    const sourceUrl = getSourceUrlFromSessionStorage();
    if (sourceUrl) {
      window.location.href = sourceUrl;
      return;
    }

    if (isWebview()) {
      goBack();
      return;
    }

    history.goBack();
  };

  const renderOfflineContent = () => (
    <>
      {isInWebview ? (
        <NativeHeader isPage title="" navFunc={handleNavBack} />
      ) : (
        <header className="tw-absolute  tw-container tw-p-12 sm:tw-p-12px" style={{ zIndex: 101 }}>
          <img className={styles.MenuHeaderLogoOffline} src={ArrowBackIcon} alt="" onClick={handleNavBack} />
        </header>
      )}
    </>
  );

  if (!enableLiveOnline && ifShouldShowHeader) {
    return <>{renderOfflineContent()}</>;
  }
  return <>{renderNormalContent()}</>;
};

MenuHeader.displayName = 'MenuHeader';

MenuHeader.propTypes = {
  webHeaderVisibility: PropTypes.bool,
};

MenuHeader.defaultProps = {
  webHeaderVisibility: false,
};

export default MenuHeader;
