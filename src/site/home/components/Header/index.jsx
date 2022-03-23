import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getAddressName } from '../../../../redux/modules/address/selectors';
import { getIsTNGMiniProgram } from '../../../redux/modules/app';
import { homeActionCreators as homeActions } from '../../../redux/modules/home';
import { IconMapPin, IconScanner } from '../../../../components/Icons';
import CleverTap from '../../../../utils/clevertap';
import styles from './Header.module.scss';

const Header = ({ onClick }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const addressName = useSelector(getAddressName);
  const isTnGMiniProgram = useSelector(getIsTNGMiniProgram);

  const clickQRScannerHandler = useCallback(() => {
    CleverTap.pushEvent('Homepage - Click QR Scan');
    dispatch(homeActions.goToQRScannerPage());
    onClick();
  }, [dispatch, onClick]);

  const clickLocationBarHandler = useCallback(() => {
    CleverTap.pushEvent('Homepage - Click Location Bar');
    dispatch(homeActions.gotoLocationPage());
    onClick();
  }, [dispatch, onClick]);

  return (
    <section className={styles.HeaderContainer} data-heap-name="site.home.delivery-bar">
      <div
        className="tw-flex-grow tw-flex tw-justify-start tw-items-center tw-overflow-hidden"
        role="button"
        tabIndex="0"
        onClick={clickLocationBarHandler}
      >
        <IconMapPin className="tw-flex-shrink-0 sm:tw-p-8px tw-p-8" />
        <div className="tw-flex-grow tw-flex tw-flex-col tw-overflow-hidden">
          <span className="tw-text-xs tw-leading-relaxed">{t('DeliverTo')}</span>
          <p className="tw-flex-grow tw-text-base tw-font-bold tw-leading-relaxed tw-truncate">{addressName}</p>
        </div>
      </div>
      <div className="tw-flex tw-justify-end tw-items-center">
        {!isTnGMiniProgram && (
          <div
            data-heap-name="site.home.qr-scan-icon"
            role="button"
            tabIndex="-1"
            aria-label="Click QR Scanner"
            className="tw-flex tw-items-center"
            onClick={clickQRScannerHandler}
          >
            <IconScanner className="tw-flex-shrink-0 sm:tw-p-8px tw-p-8" />
          </div>
        )}
      </div>
    </section>
  );
};

Header.displayName = 'Header';

Header.propTypes = {
  onClick: PropTypes.func,
};

Header.defaultProps = {
  onClick: () => {},
};

export default Header;
