import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { CaretRight } from 'phosphor-react';
import RewardsIcon from '../../../../../../../images/rewards-icon-rewards.svg';
import RewardsPointsIcon from '../../../../../../../images/rewards-icon-points.svg';
import RewardsCashbackIcon from '../../../../../../../images/rewards-icon-cashback.svg';
import RewardsStoreCreditsIcon from '../../../../../../../images/rewards-icon-store-credits.svg';
import Button from '../../../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import './Rewards.scss';

const Rewards = ({
  isNewMember,
  enabledCashback,
  enabledLoyalty,
  enabledMembershipPoints,
  rewardsAvailableCount,
  points,
  cashbackPrice,
  storeCreditsPrice,
}) => {
  const { t } = useTranslation('OrderingThankYou');
  const enabledCashbackOrStoreCredits = enabledCashback || enabledLoyalty;
  const isRewardsCountAvailable = rewardsAvailableCount > 0;
  const shouldShowRewardsBanner = isRewardsCountAvailable > 0 && !isNewMember;
  const shouldShowRewardsItem = isRewardsCountAvailable && isNewMember;
  const shouldShowPointsItem = enabledMembershipPoints && points > 0;

  return (
    <>
      {shouldShowRewardsBanner && (
        <section className="card rewards-banner__card-wrapper margin-small">
          <Button
            type="text"
            theme="ghost"
            data-test-id="ordering.thank-you.rewards.rewards-banner-button"
            className="rewards-banner__card-container"
            contentClassName="rewards-banner__card-content flex flex-middle flex-space-between padding-smaller"
          >
            <div className="rewards-banner__card-icon">
              <ObjectFitImage noCompression src={RewardsIcon} alt="StoreHub Rewards Icon" />
            </div>
            <p className="rewards-banner__card-title text-left padding-left-right-small">
              {t('RewardBannerTitle', {
                availableCount: rewardsAvailableCount,
              })}
            </p>

            <CaretRight size={32} weight="light" />
          </Button>
        </section>
      )}

      <section className="card margin-small padding-smaller">
        <div className="flex flex-middle flex-space-between">
          <h3 className="rewards-card__title padding-small">
            {isNewMember ? t('RewardsCardNewMemberTitle') : t('RewardsCardReturningMemberTitle')}
          </h3>
          {!isNewMember && (
            <Button
              type="text"
              theme="info"
              className="rewards-card__check-balance-button"
              contentClassName="rewards-card__check-balance-button-content"
            >
              {t('RewardsCardReturningMemberCheckBalanceText')}
            </Button>
          )}
        </div>
        <div className="flex flex-middle">
          <ul className="flex__fluid-content">
            {shouldShowRewardsItem && (
              <li className="flex flex-middle padding-left-right-small margin-top-bottom-small">
                <div className="rewards-card__item-icon flex__shrink-fixed">
                  <ObjectFitImage noCompression src={RewardsIcon} alt="StoreHub Rewards Icon" />
                </div>
                <span className="rewards-card__item-text flex__fluid-content padding-left-right-small">
                  {t('RewardsCardRewardsItemText', { availableCount: rewardsAvailableCount })}
                </span>
              </li>
            )}

            {shouldShowPointsItem && (
              <li className="flex flex-middle padding-left-right-small margin-top-bottom-small">
                <div className="rewards-card__item-icon flex__shrink-fixed">
                  <ObjectFitImage noCompression src={RewardsPointsIcon} alt="StoreHub Points Icon" />
                </div>
                <span className="rewards-card__item-text flex__fluid-content padding-left-right-small">
                  {t('RewardsCardPointsItemText', { points })}
                </span>
              </li>
            )}

            {enabledCashbackOrStoreCredits && (
              <li className="flex flex-middle padding-left-right-small margin-top-bottom-small">
                <div className="rewards-card__item-icon flex__shrink-fixed">
                  <ObjectFitImage
                    noCompression
                    src={enabledCashback ? RewardsCashbackIcon : RewardsStoreCreditsIcon}
                    alt="StoreHub Rewards Cashback Icon"
                  />
                </div>
                <span className="rewards-card__item-text flex__fluid-content padding-left-right-small">
                  {t('RewardsCardCashbackItemText', {
                    cashbackPrice: enabledCashback ? cashbackPrice : storeCreditsPrice,
                  })}
                </span>
              </li>
            )}
          </ul>

          {isNewMember && (
            <CaretRight
              className="rewards-card__caret-right-icon flex__shrink-fixed margin-left-right-small"
              size={32}
              weight="light"
            />
          )}
        </div>
      </section>
    </>
  );
};

Rewards.displayName = 'RewardsCard';

Rewards.propTypes = {
  isNewMember: PropTypes.bool,
  enabledCashback: PropTypes.bool,
  enabledLoyalty: PropTypes.bool,
  enabledMembershipPoints: PropTypes.bool,
  rewardsAvailableCount: PropTypes.number,
  points: PropTypes.number,
  cashbackPrice: PropTypes.string,
  storeCreditsPrice: PropTypes.string,
};

Rewards.defaultProps = {
  isNewMember: false,
  enabledCashback: false,
  enabledLoyalty: false,
  enabledMembershipPoints: false,
  rewardsAvailableCount: 0,
  points: 0,
  cashbackPrice: null,
  storeCreditsPrice: null,
};

export default Rewards;
