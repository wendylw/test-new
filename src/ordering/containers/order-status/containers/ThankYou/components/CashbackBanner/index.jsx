import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { getCashbackCurrency, getIsCashbackAvailable } from '../../redux/selector';
import IconGiveCashBag from '../../../../../../../images/icon-give-cash-bag.svg';
import IconCelebration from '../../../../../../../images/icon-celebration.svg';
import { IconClose } from '../../../../../../../components/Icons';
import './index.scss';

function CashbackBanner({ currency, isCashbackAvailable, onLoginButtonClick, onShowBannerClick, onHideBannerClick }) {
  const [isBannerVisible, setBannerVisibility] = useState(true);
  const toggleBannerHandler = useCallback(() => {
    setBannerVisibility(prevBannerVisible => {
      prevBannerVisible ? onHideBannerClick() : onShowBannerClick();
      return !prevBannerVisible;
    });
  }, []);
  const { t } = useTranslation('OrderingThankYou');

  const { title, description } = isCashbackAvailable
    ? {
        title: t('GotCashBackTitle', { currency }),
        description: t('GotCashBackDescription'),
      }
    : {
        title: t('WantFutureCashbackTitle'),
        description: t('WantFutureCashbackDescription'),
      };

  return (
    <>
      <div
        className={`${
          isBannerVisible ? 'visible' : 'invisible'
        } cashback-banner cashback-banner__fixed-wrapper card margin-small padding-normal flex flex-top`}
      >
        <img src={IconGiveCashBag} className="icon icon__small" alt="Beep Cash Bag" />
        <div className="cashback-banner__content-wrapper flex flex-column flex-top">
          <h1 className="cashback-banner__title flex flex-middle margin-top-bottom-smaller">
            <span className="text-size-big text-weight-bolder">{title}</span>
            {isCashbackAvailable && <img src={IconCelebration} className="icon" alt="Beep Celebration" />}
          </h1>
          <p>{description}</p>
          <button
            className="cashback-banner__login-button button button__fill text-weight-bolder text-uppercase padding-left-right-normal"
            onClick={onLoginButtonClick}
          >
            {t('WantCashBackTitle')}
          </button>
        </div>
        <IconClose className="cashback-banner__close-button icon" onClick={toggleBannerHandler} />
      </div>
      <button
        className={`${
          isBannerVisible ? 'invisible' : 'visible'
        } cashback-floating-button cashback-floating-button__fixed-wrapper flex flex-column flex-middle margin-bottom-normal`}
        onClick={toggleBannerHandler}
      >
        <img src={IconGiveCashBag} className="cashback-floating-button__icon" alt="Beep Cash Bag" />
        <div className="cashback-floating-button__content text-size-smaller text-weight-bolder text-uppercase card padding-smaller">
          {t('ClaimMyCashback')}
        </div>
      </button>
    </>
  );
}

CashbackBanner.displayName = 'CashbackBanner';

CashbackBanner.propTypes = {
  currency: PropTypes.string,
  isCashbackAvailable: PropTypes.bool,
  onLoginButtonClick: PropTypes.func,
  onShowBannerClick: PropTypes.func,
  onHideBannerClick: PropTypes.func,
};

CashbackBanner.defaultProps = {
  currency: 'RM 0.0',
  isCashbackAvailable: false,
  onLoginButtonClick: () => {},
  onShowBannerClick: () => {},
  onHideBannerClick: () => {},
};

export default connect(state => ({
  currency: getCashbackCurrency(state),
  isCashbackAvailable: getIsCashbackAvailable(state),
}))(CashbackBanner);
