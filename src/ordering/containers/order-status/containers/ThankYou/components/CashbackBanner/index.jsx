import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { getCashbackCurrency, getIsCashbackAvailable } from '../../redux/selector';
import IconGiveCashBag from '../../../../../../../images/icon-give-cash-bag.svg';
import { IconClose } from '../../../../../../../components/Icons';
import './index.scss';

function CashbackBanner({ currency, isCashbackAvailable, onLoginButtonClick, onShowBannerClick, onHideBannerClick }) {
  const [isBannerVisible, setBannerVisibility] = useState(true);
  const toggleBannerHandler = useCallback(() => {
    setBannerVisibility(prevBannerVisible => {
      prevBannerVisible ? onHideBannerClick() : onShowBannerClick();
      return !prevBannerVisible;
    });
  }, [onHideBannerClick, onShowBannerClick]);
  const { t } = useTranslation('OrderingThankYou');

  const { title, description, buttonText } = isCashbackAvailable
    ? {
        title: t('GotCashBackTitle', { currency }),
        description: t('GotCashBackDescription'),
        buttonText: t('WantCashBackTitle'),
      }
    : {
        title: t('GetDeliveryOrderDiscountTitle'),
        description: t('GetDeliveryOrderDiscountDescription'),
        buttonText: t('RedeemNow'),
      };

  return (
    <>
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
      <div
        className={`${
          isBannerVisible ? 'visible' : 'invisible'
        } cashback-banner cashback-banner__absolute-wrapper card padding-top-bottom-small margin-small`}
      >
        <div className="flex flex-top">
          <div className="cashback-banner__content flex flex-top flex__fluid-content padding-small">
            <img src={IconGiveCashBag} className="icon icon__small" alt="Beep Cash Bag" />
            <div className="margin-left-right-smaller">
              <h2 className="flex flex-middle">
                <span className="text-weight-bolder">{title}</span>
                {isCashbackAvailable && (
                  <span role="img" aria-label="celebration">
                    🎉
                  </span>
                )}
              </h2>
              <p className="text-line-height-base">{description}</p>
            </div>
          </div>
          <IconClose className="cashback-banner__close-button icon icon__small" onClick={toggleBannerHandler} />
        </div>
        <div className="padding-small text-center">
          <button
            className="cashback-banner__login-button button button__fill text-weight-bolder text-uppercase padding-left-right-normal"
            onClick={onLoginButtonClick}
          >
            {buttonText}
          </button>
        </div>
      </div>
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
