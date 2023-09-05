import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CaretLeft } from 'phosphor-react';
import _truncate from 'lodash/truncate';
import PowerByBeepLogo from '../../../../../images/powered-by-beep-logo.svg';
import BackArrow from '../../../../../images/back-arrow-header.svg';
import {
  getTableId,
  getShouldShowStoreNameInNativeHeader,
  getStoreDisplayTitle,
  getStoreFullDisplayTitle,
  getHasUserSaveStore,
  getShouldShowFavoriteButton,
  getIsShowBackButton,
  getShouldCheckSaveStoreStatus,
} from '../../redux/common/selectors';
import { getIsProductDetailDrawerVisible } from '../../redux/productDetail/selectors';
import { hideProductDetailDrawer } from '../../redux/productDetail/thunks';
import styles from './MenuHeader.module.scss';
import {
  isWebview,
  isTakeAwayType,
  isDeliveryOrder,
  isQROrder,
  getSourceUrlFromSessionStorage,
} from '../../../../../common/utils';
import NativeHeader, { ICON_RES } from '../../../../../components/NativeHeader';
import { closeWebView } from '../../../../../utils/native-methods';
import { getDeliveryInfo, getIsFromBeepSite, getIsFromFoodCourt } from '../../../../redux/modules/app';
import * as NativeMethods from '../../../../../utils/native-methods';
import { goBack, loadUserFavStoreStatus, saveFavoriteStore, shareStore } from '../../redux/common/thunks';
import logger from '../../../../../utils/monitoring/logger';

const OfflinePageHeader = () => {
  const dispatch = useDispatch();

  const goBackToPreviousPage = () => {
    dispatch(goBack());
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
            data-test-id="ordering.menu.header.back-btn"
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
  const isFromBeepSitePage = useSelector(getIsFromBeepSite);
  const isFromFoodCourt = useSelector(getIsFromFoodCourt);
  const { enableLiveOnline } = useSelector(getDeliveryInfo);
  const storeFullDisplayTitle = useSelector(getStoreFullDisplayTitle);
  const hasUserSaveStore = useSelector(getHasUserSaveStore);
  const shouldShowFavoriteButton = useSelector(getShouldShowFavoriteButton);
  const isShowBackButton = useSelector(getIsShowBackButton);
  const shouldCheckSaveStoreStatus = useSelector(getShouldCheckSaveStoreStatus);
  const history = useHistory();

  useEffect(() => {
    if (shouldCheckSaveStoreStatus) {
      dispatch(loadUserFavStoreStatus());
    }
  }, [dispatch, shouldCheckSaveStoreStatus]);

  const createRightContentHtml = useCallback(
    content => (
      <div className="tw-flex-shrink-0">
        <span className="tw-p-16 sm:tw-p-16px tw-text-gray-700">{content}</span>
      </div>
    ),
    []
  );

  const getShareLinkConfig = () => {
    const { SHARE } = ICON_RES;

    if (!isDeliveryOrder()) return null;

    try {
      const { BEEP_MODULE_METHODS } = NativeMethods;
      const hasShareLinkSupport = NativeMethods.hasMethodInNative(BEEP_MODULE_METHODS.SHARE_LINK);
      if (!hasShareLinkSupport) {
        return null;
      }
      const storeName = _truncate(`${storeFullDisplayTitle}`, { length: 33 });
      const title = t('ShareTitle', { storeName });
      return {
        id: 'headerRightShareButton',
        iconRes: SHARE,
        onClick: () => {
          dispatch(shareStore(title));
        },
      };
    } catch (error) {
      logger.error('Ordering_Menu_getShareLinkConfigFailed', { message: error?.message || '' });

      return null;
    }
  };

  const getSaveFavoriteStoreConfig = () => {
    const { FAVORITE, FAVORITE_BORDER } = ICON_RES;

    if (!shouldShowFavoriteButton) return null;

    return {
      id: 'headerRightFavoriteButton',
      iconRes: hasUserSaveStore ? FAVORITE : FAVORITE_BORDER,
      onClick: () => {
        dispatch(saveFavoriteStore());
      },
    };
  };

  const rightContentForNativeHeader = () => {
    if (isQROrder()) {
      if (tableId) {
        return { text: t('TableIdText', { tableId }) };
      }
      if (isTakeAwayType()) {
        return { text: t('TakeAway').toUpperCase() };
      }
    }

    const rightContents = [];

    rightContents.push(getShareLinkConfig());
    rightContents.push(getSaveFavoriteStoreConfig());

    // Filter out falsy values
    return rightContents.filter(config => config);
  };

  const handleClickNativeBackButton = useCallback(() => {
    if (isProductDetailDrawerVisible) {
      dispatch(hideProductDetailDrawer(false));
      return;
    }

    if (isFromFoodCourt) {
      const sourceUrl = getSourceUrlFromSessionStorage();
      window.location.href = sourceUrl;
      return;
    }

    // By default, just close the button
    closeWebView();
  }, [dispatch, isFromFoodCourt, isProductDetailDrawerVisible]);

  const rightContentForWebHeader = () => {
    if (isQROrder()) {
      if (tableId) {
        return createRightContentHtml(t('TableIdText', { tableId }));
      }
      if (isTakeAwayType()) {
        return createRightContentHtml(t('TakeAway').toUpperCase());
      }
    }
    return null;
  };

  const leftContentForWebHeader = () => {
    if (isShowBackButton) {
      return (
        <img
          className={styles.MenuHeaderBackArrow}
          src={BackArrow}
          alt=""
          data-test-id="ordering.menu.header.back-btn"
          onClick={() => dispatch(goBack())}
        />
      );
    }

    return <img className={styles.MenuHeaderLogo} src={PowerByBeepLogo} alt="" />;
  };

  const webHeader = webHeaderVisibility ? (
    <header className="tw-flex tw-justify-between tw-items-center tw-border-0 tw-border-b tw-border-solid tw-border-gray-200">
      <h2 className={styles.MenuHeaderLogoContainer}>{leftContentForWebHeader()}</h2>
      {rightContentForWebHeader()}
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
          rightContent={rightContentForNativeHeader()}
          title={showStoreName ? storeDisplayTitle : ''}
          navFunc={() => handleClickNativeBackButton()}
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
