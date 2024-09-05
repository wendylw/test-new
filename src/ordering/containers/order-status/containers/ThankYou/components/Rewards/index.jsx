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

const Rewards = ({ isNewMember, enabledCashback, enabledLoyalty }) => {
  const { t } = useTranslation('OrderingThankYou');
  const enabledCashbackOrStoreCredits = enabledCashback || enabledLoyalty;

  return (
    <>
      {!isNewMember && (
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
            <p className="rewards-banner__card-title text-left padding-left-right-small">{t('RewardBannerTitle')}</p>

            <CaretRight size={32} weight="light" />
          </Button>
        </section>
      )}

      <section>
        <div className="flex flex-middle flex-space-between">
          <h3 className="rewards-card__title">
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
        <ul>
          <li className="flex flex-middle">
            <div className="rewards-card__item-icon flex__shrink-fixed">
              <ObjectFitImage noCompression src={RewardsIcon} alt="StoreHub Rewards Icon" />
            </div>
            <span className="flex__fluid-content">3 Rewards</span>
          </li>
          <li className="flex flex-middle">
            <div className="rewards-card__item-icon flex__shrink-fixed">
              <ObjectFitImage noCompression src={RewardsPointsIcon} alt="StoreHub Rewards Icon" />
            </div>
            <span className="flex__fluid-content">200 Points</span>
          </li>
          {enabledCashbackOrStoreCredits && (
            <li className="flex flex-middle">
              <div className="rewards-card__item-icon flex__shrink-fixed">
                <ObjectFitImage noCompression src={RewardsCashbackIcon} alt="StoreHub Rewards Icon" />
                <ObjectFitImage noCompression src={RewardsStoreCreditsIcon} alt="StoreHub Rewards Icon" />
              </div>
              <span className="flex__fluid-content">RM 1.23 Cashback</span>
            </li>
          )}
        </ul>
        <CaretRight size={32} weight="light" />
      </section>
    </>
  );
};

Rewards.displayName = 'RewardsCard';

Rewards.propTypes = {
  isNewMember: PropTypes.bool,
  enabledCashback: PropTypes.bool,
  enabledLoyalty: PropTypes.bool,
};

Rewards.defaultProps = {
  isNewMember: false,
  enabledCashback: false,
  enabledLoyalty: false,
};

export default Rewards;
