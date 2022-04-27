import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CaretLeft } from 'phosphor-react';
import PowerByBeepLogo from '../../../../../images/powered-by-beep-logo.svg';
import { getTableId, getShouldShowStoreNameInNativeHeader, getStoreDisplayTitle } from '../../redux/common/selectors';
import { getIsProductDetailDrawerVisible } from '../../redux/productDetail/selectors';
import { hideProductDetailDrawer } from '../../redux/productDetail/thunks';
import styles from './MenuHeader.module.scss';
import {
  isWebview,
  isDineInType,
  isTakeAwayType,
  getSourceUrlFromSessionStorage,
  isFromBeepSite,
} from '../../../../../common/utils';
import NativeHeader from '../../../../../components/NativeHeader';
import { closeWebView, goBack } from '../../../../../utils/native-methods';
import { getDeliveryInfo } from '../../../../redux/modules/app';

const OfflinePageHeader = ({ history }) => {
  const goBackToPreviousPage = () => {
    const sourceUrl = getSourceUrlFromSessionStorage();
    // There is source url in session storage, so we can redirect to the source page
    if (sourceUrl) {
      window.location.href = sourceUrl;
      return;
    }

    // Native back to previous page
    if (isWebview()) {
      goBack();

      return;
    }

    history.goBack();
  };

  return (
    <>
      {isWebview() ? (
        <NativeHeader
          isPage
          title=""
          navFunc={() => {
            goBackToPreviousPage();
          }}
        />
      ) : (
        <header className="tw-absolute  tw-container tw-p-12 sm:tw-p-12px" style={{ zIndex: 101 }}>
          <button
            className={styles.MenuHeaderLogoOffline}
            onClick={() => {
              goBackToPreviousPage();
            }}
          >
            <CaretLeft size={24} weight="light" />
          </button>
        </header>
      )}
    </>
  );
};

OfflinePageHeader.displayName = 'OfflinePageHeader';

const MenuHeader = ({ webHeaderVisibility }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const tableId = useSelector(getTableId);
  const showStoreName = useSelector(getShouldShowStoreNameInNativeHeader);
  const storeDisplayTitle = useSelector(getStoreDisplayTitle);
  const isProductDetailDrawerVisible = useSelector(getIsProductDetailDrawerVisible);
  const isInWebview = isWebview();
  const isFromBeepSitePage = isFromBeepSite();
  const { enableLiveOnline } = useSelector(getDeliveryInfo);
  const history = useHistory();
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

  // Offline header will be shown only when the user is in webview and the user is from beep site
  if (!enableLiveOnline && (isInWebview || isFromBeepSitePage)) {
    return <OfflinePageHeader history={history} />;
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
              const sourceUrl = getSourceUrlFromSessionStorage();
              // There is source url in session storage, so we can redirect to the source page
              if (sourceUrl) {
                window.location.href = sourceUrl;
                return;
              }

              closeWebView();
            }
          }}
        />
      ) : (
        webHeader
      )}
    </>
  );
};

MenuHeader.displayName = 'MenuHeader';

MenuHeader.propTypes = {
  webHeaderVisibility: PropTypes.bool,
};

MenuHeader.defaultProps = {
  webHeaderVisibility: false,
};

export default MenuHeader;
