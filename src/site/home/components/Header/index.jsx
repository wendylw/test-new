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
    <section className={styles.HeaderContainer} data-heap-name="site.home.delivery-bar">
      <div
        className="tw-flex-grow tw-flex tw-justify-start tw-items-center tw-overflow-hidden sm:tw-p-4px tw-p-4"
        role="button"
        tabIndex="0"
        onClick={onLocationBarClick}
      >
        <MapPinIcon className="tw-flex-shrink-0 sm:tw-p-4px tw-p-4" />
        <div className="tw-flex-grow tw-flex tw-flex-col tw-overflow-hidden">
          <span className="tw-text-xs tw-leading-relaxed tw-uppercase">{t('DeliverTo')}</span>
          <p className="tw-flex-grow tw-text-base tw-font-bold tw-leading-relaxed tw-truncate">{addressName}</p>
        </div>
      </div>
      <div className="tw-flex tw-justify-end tw-items-stretch">
        {!isTnGMiniProgram && (
          <Link
            to={ROUTER_PATHS.QRSCAN}
            data-heap-name="site.home.qr-scan-icon"
            className="tw-flex tw-items-center sm:tw-px-8px tw-px-8"
            onClick={onQRScannerClick}
          >
            <Scan className="tw-flex-shrink-0 tw-text-gray" size={24} />
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
