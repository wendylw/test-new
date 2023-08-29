import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Scan } from 'phosphor-react';
import { getAddressName } from '../../../../redux/modules/address/selectors';
import { getIsTNGMiniProgram } from '../../../redux/modules/app';
import { MapPinIcon } from '../../../../common/components/Icons';
import Constants from '../../../../utils/constants';
import styles from './Header.module.scss';

const { ROUTER_PATHS } = Constants;

const Header = ({ onLocationBarClick, onQRScannerClick }) => {
  const { t } = useTranslation();

  const addressName = useSelector(getAddressName);
  const isTnGMiniProgram = useSelector(getIsTNGMiniProgram);

  return (
    <section className={styles.HeaderContainer} data-test-id="site.home.delivery-bar">
      <div
        data-test-id="site.home.header.location-bar"
        className="tw-flex-grow tw-flex tw-justify-start tw-items-center tw-overflow-hidden sm:tw-px-4px tw-px-4 tw-cursor-pointer"
        role="button"
        tabIndex="0"
        onClick={onLocationBarClick}
      >
        <MapPinIcon className={styles.HeaderMapPinIcon} size={28} />
        <div className="tw-flex-grow tw-flex tw-flex-col tw-overflow-hidden">
          <span className="tw-text-xs tw-leading-loose tw-uppercase">{t('DeliverTo')}</span>
          <p className="tw-flex-grow tw-text-base tw-font-bold tw-leading-relaxed tw-truncate">{addressName}</p>
        </div>
      </div>
      <div className="tw-flex tw-justify-end tw-items-stretch tw-flex-shrink-0">
        {!isTnGMiniProgram && (
          <Link
            to={ROUTER_PATHS.QRSCAN}
            data-test-id="site.home.qr-scan-icon"
            className="tw-flex tw-items-center sm:tw-p-8px tw-p-8"
            onClick={onQRScannerClick}
          >
            <Scan className="tw-flex-shrink-0 tw-text-gray" size={24} weight="light" />
          </Link>
        )}
      </div>
    </section>
  );
};

Header.displayName = 'Header';

Header.propTypes = {
  onLocationBarClick: PropTypes.func,
  onQRScannerClick: PropTypes.func,
};

Header.defaultProps = {
  onLocationBarClick: () => {},
  onQRScannerClick: () => {},
};

export default Header;
