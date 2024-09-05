import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CaretRight } from 'phosphor-react';
import RewardsIcon from '../../../../../../../images/rewards-icon-rewards.svg';
import RewardsPointsIcon from '../../../../../../../images/rewards-icon-points.svg';
import RewardsCashbackIcon from '../../../../../../../images/rewards-icon-cashback.svg';
import RewardsStoreCreditsIcon from '../../../../../../../images/rewards-icon-store-credits.svg';
import {
  getIsMerchantEnabledCashback,
  getIsMerchantEnabledStoreCredits,
  getIsMerchantMembershipPointsEnabled,
} from '../../../../../../../redux/modules/merchant/selectors';
import { getIsJoinMembershipNewMember } from '../../../../../../../redux/modules/membership/selectors';
import Button from '../../../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import './Rewards.scss';

const MemberRewardsContainer = ({ isJoinMembershipNewMember, children }) =>
  isJoinMembershipNewMember ? (
    <Button
      type="text"
      theme="ghost"
      data-test-id="ordering.thank-you.rewards.rewards-card.new-member-container-button"
      contentClassName="flex flex-middle"
    >
      <div>{children}</div>
      {isJoinMembershipNewMember && (
        <CaretRight
          className="rewards-card__caret-right-icon flex__shrink-fixed margin-left-right-small"
          size={32}
          weight="light"
        />
      )}
    </Button>
  ) : (
    <>{children}</>
  );

MemberRewardsContainer.displayName = 'MemberRewardsContainer';

MemberRewardsContainer.propTypes = {
  isJoinMembershipNewMember: PropTypes.bool,
  children: PropTypes.node,
};

MemberRewardsContainer.defaultProps = {
  isJoinMembershipNewMember: false,
  children: null,
};

const Rewards = ({
  isJoinMembershipNewMember,
  isMerchantEnabledCashback,
  isMerchantEnabledStoreCredits,
  isMerchantMembershipPointsEnabled,
  rewardsAvailableCount,
  points,
  cashbackPrice,
  storeCreditsPrice,
}) => {
  const { t } = useTranslation('OrderingThankYou');
  const enabledCashbackOrStoreCredits = isMerchantEnabledCashback || isMerchantEnabledStoreCredits;
  const isRewardsCountAvailable = rewardsAvailableCount > 0;
  const shouldShowRewardsBanner = isRewardsCountAvailable > 0 && !isJoinMembershipNewMember;
  const shouldShowRewardsItem = isRewardsCountAvailable && isJoinMembershipNewMember;
  const shouldShowPointsItem = isMerchantMembershipPointsEnabled && points > 0;

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
        <MemberRewardsContainer isJoinMembershipNewMember={isJoinMembershipNewMember}>
          <div className="flex flex-middle flex-space-between">
            <h3 className="rewards-card__title padding-small">
              {isJoinMembershipNewMember ? t('RewardsCardNewMemberTitle') : t('RewardsCardReturningMemberTitle')}
            </h3>
            {!isJoinMembershipNewMember && (
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
                    src={isMerchantEnabledCashback ? RewardsCashbackIcon : RewardsStoreCreditsIcon}
                    alt="StoreHub Rewards Cashback Icon"
                  />
                </div>
                <span className="rewards-card__item-text flex__fluid-content padding-left-right-small">
                  {t('RewardsCardCashbackItemText', {
                    cashbackPrice: isMerchantEnabledCashback ? cashbackPrice : storeCreditsPrice,
                  })}
                </span>
              </li>
            )}
          </ul>
        </MemberRewardsContainer>
      </section>
    </>
  );
};

Rewards.displayName = 'Rewards';

Rewards.propTypes = {
  isJoinMembershipNewMember: PropTypes.bool,
  isMerchantEnabledCashback: PropTypes.bool,
  isMerchantEnabledStoreCredits: PropTypes.bool,
  isMerchantMembershipPointsEnabled: PropTypes.bool,
  rewardsAvailableCount: PropTypes.number,
  points: PropTypes.number,
  cashbackPrice: PropTypes.string,
  storeCreditsPrice: PropTypes.string,
};

Rewards.defaultProps = {
  isJoinMembershipNewMember: false,
  isMerchantEnabledCashback: false,
  isMerchantEnabledStoreCredits: false,
  isMerchantMembershipPointsEnabled: false,
  rewardsAvailableCount: 0,
  points: 0,
  cashbackPrice: null,
  storeCreditsPrice: null,
};

export default connect(state => ({
  isJoinMembershipNewMember: getIsJoinMembershipNewMember(state),
  isMerchantEnabledCashback: getIsMerchantEnabledCashback(state),
  isMerchantEnabledStoreCredits: getIsMerchantEnabledStoreCredits(state),
  isMerchantMembershipPointsEnabled: getIsMerchantMembershipPointsEnabled(state),
}))(Rewards);
