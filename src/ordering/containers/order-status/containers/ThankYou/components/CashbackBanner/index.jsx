import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { getCashbackCurrency, getIsCashbackAvailable } from '../../redux/selector';
import { getIsMerchantMembershipEnabled } from '../../../../../../../redux/modules/merchant/selectors';
import IconGiveCashBag from '../../../../../../../images/icon-give-cash-bag.svg';
import { IconClose } from '../../../../../../../components/Icons';
import './index.scss';

function CashbackBanner({
  currency,
  isCashbackAvailable,
  isMerchantMembershipEnabled,
  onLoginButtonClick,
  onShowBannerClick,
  onHideBannerClick,
}) {
  const [isBannerVisible, setBannerVisibility] = useState(true);
  const toggleBannerHandler = useCallback(() => {
    setBannerVisibility(prevBannerVisible => {
      prevBannerVisible ? onHideBannerClick() : onShowBannerClick();
      return !prevBannerVisible;
    });
  }, [onHideBannerClick, onShowBannerClick]);
  const { t } = useTranslation('OrderingThankYou');

  const { title, description, bannerButtonText, floatingButtonText } = isCashbackAvailable
    ? {
        title: t('GotCashBackTitle', { currency }),
        description: t(isMerchantMembershipEnabled ? 'GotCashBackAndBeMemberDescription' : 'GotCashBackDescription'),
        bannerButtonText: t('WantCashBackTitle'),
        floatingButtonText: t('ClaimMyCashback'),
      }
    : {
        title: t('GetDeliveryOrderDiscountTitle'),
        description: t('GetDeliveryOrderDiscountDescription'),
        bannerButtonText: t('RedeemNow'),
        floatingButtonText: t('ExclusiveOffers'),
      };

  return (
    <>
      <button
        className={`${
          isBannerVisible ? 'invisible' : 'visible'
        } cashback-floating-button cashback-floating-button__absolute-wrapper flex flex-column flex-middle margin-normal`}
        data-test-id="ordering.order-status.thank-you.cashback-banner.toggle-btn"
        onClick={toggleBannerHandler}
      >
        <img src={IconGiveCashBag} className="cashback-floating-button__icon" alt="Beep Cash Bag" />
        <div className="cashback-floating-button__content text-size-smaller text-weight-bolder text-uppercase card padding-smaller">
          {floatingButtonText}
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
                  <span role="img" aria-label="celebration" className="padding-left-right-smaller">
                    🎉
                  </span>
                )}
              </h2>
              <p className="text-line-height-base">{description}</p>
            </div>
          </div>
          <IconClose
            className="cashback-banner__close-button icon icon__small"
            data-test-id="ordering.order-status.thank-you.cashback-banner.close-btn"
            onClick={toggleBannerHandler}
          />
        </div>
        <div className="padding-small text-center">
          <button
            className="cashback-banner__login-button button button__fill text-weight-bolder text-uppercase padding-left-right-normal"
            data-test-id="ordering.order-status.thank-you.cashback-banner.login-btn"
            onClick={onLoginButtonClick}
          >
            {bannerButtonText}
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
  isMerchantMembershipEnabled: PropTypes.bool,
  onLoginButtonClick: PropTypes.func,
  onShowBannerClick: PropTypes.func,
  onHideBannerClick: PropTypes.func,
};

CashbackBanner.defaultProps = {
  currency: 'RM 0.0',
  isCashbackAvailable: false,
  isMerchantMembershipEnabled: false,
  onLoginButtonClick: () => {},
  onShowBannerClick: () => {},
  onHideBannerClick: () => {},
};

export default connect(state => ({
  currency: getCashbackCurrency(state),
  isCashbackAvailable: getIsCashbackAvailable(state),
  isMerchantMembershipEnabled: getIsMerchantMembershipEnabled(state),
}))(CashbackBanner);
