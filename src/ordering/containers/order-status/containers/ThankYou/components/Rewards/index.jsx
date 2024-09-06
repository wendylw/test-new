import React, { useCallback } from 'react';
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
  getIsMerchantMembershipPointsEnabled,
} from '../../../../../../../redux/modules/merchant/selectors';
import { getIsJoinMembershipNewMember } from '../../../../../../../redux/modules/membership/selectors';
import { getCustomerAvailablePointsBalance, getCustomerRewardsTotal } from '../../../../../../redux/modules/app';
import {
  getIsMerchantCashbackOrStoreCreditsEnabled,
  getShouldShowRewardsBanner,
  getCustomerCashbackPrice,
} from '../../redux/selector';
import Button from '../../../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import './Rewards.scss';

const MemberRewardsContainer = ({ isJoinMembershipNewMember, children, onClickContainer }) => {
  const handleContainerClick = useCallback(
    event => {
      event.stopPropagation();
      onClickContainer('New Member Rewards Card');
    },
    [onClickContainer]
  );

  return isJoinMembershipNewMember ? (
    <Button
      type="text"
      theme="ghost"
      data-test-id="ordering.thank-you.rewards.rewards-card.new-member-container-button"
      contentClassName="flex flex-middle"
      onClick={handleContainerClick}
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
};

MemberRewardsContainer.displayName = 'MemberRewardsContainer';

MemberRewardsContainer.propTypes = {
  isJoinMembershipNewMember: PropTypes.bool,
  children: PropTypes.node,
  onClickContainer: PropTypes.func,
};

MemberRewardsContainer.defaultProps = {
  isJoinMembershipNewMember: false,
  children: null,
  onClickContainer: () => {},
};

const Rewards = ({
  shouldShowRewardsBanner,
  isJoinMembershipNewMember,
  isMerchantEnabledCashback,
  isMerchantCashbackOrStoreCreditsEnabled,
  isMerchantMembershipPointsEnabled,
  rewardsAvailableCount,
  customerAvailablePointsBalance,
  customerCashbackPrice,
  onViewMembershipDetailClick,
}) => {
  const { t } = useTranslation('OrderingThankYou');
  const handleRewardsBannerClick = useCallback(() => {
    onViewMembershipDetailClick('Rewards Banner');
  }, [onViewMembershipDetailClick]);
  const handleCheckBalanceButtonClick = useCallback(() => {
    onViewMembershipDetailClick('Check Balance Button');
  }, [onViewMembershipDetailClick]);

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
            onClick={handleRewardsBannerClick}
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
        <MemberRewardsContainer
          isJoinMembershipNewMember={isJoinMembershipNewMember}
          onClickContainer={onViewMembershipDetailClick}
        >
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
                data-test-id="ordering.thank-you.rewards.rewards-card.check-balance-button"
                onClick={handleCheckBalanceButtonClick}
              >
                {t('RewardsCardReturningMemberCheckBalanceText')}
              </Button>
            )}
          </div>
          <ul className="flex__fluid-content">
            {isJoinMembershipNewMember && (
              <li className="flex flex-middle padding-left-right-small margin-top-bottom-small">
                <div className="rewards-card__item-icon flex__shrink-fixed">
                  <ObjectFitImage noCompression src={RewardsIcon} alt="StoreHub Rewards Icon" />
                </div>
                <span className="rewards-card__item-text flex__fluid-content padding-left-right-small">
                  {t('RewardsCardRewardsItemText', { availableCount: rewardsAvailableCount })}
                </span>
              </li>
            )}

            {isMerchantMembershipPointsEnabled && (
              <li className="flex flex-middle padding-left-right-small margin-top-bottom-small">
                <div className="rewards-card__item-icon flex__shrink-fixed">
                  <ObjectFitImage noCompression src={RewardsPointsIcon} alt="StoreHub Points Icon" />
                </div>
                <span className="rewards-card__item-text flex__fluid-content padding-left-right-small">
                  {t('RewardsCardPointsItemText', { points: customerAvailablePointsBalance })}
                </span>
              </li>
            )}

            {isMerchantCashbackOrStoreCreditsEnabled && (
              <li className="flex flex-middle padding-left-right-small margin-top-bottom-small">
                <div className="rewards-card__item-icon flex__shrink-fixed">
                  <ObjectFitImage
                    noCompression
                    src={isMerchantEnabledCashback ? RewardsCashbackIcon : RewardsStoreCreditsIcon}
                    alt="StoreHub Rewards Cashback Icon"
                  />
                </div>
                <span className="rewards-card__item-text flex__fluid-content padding-left-right-small">
                  {t('RewardsCardCashbackItemText', { cashbackPrice: customerCashbackPrice })}
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
  shouldShowRewardsBanner: PropTypes.bool,
  isJoinMembershipNewMember: PropTypes.bool,
  isMerchantEnabledCashback: PropTypes.bool,
  isMerchantCashbackOrStoreCreditsEnabled: PropTypes.bool,
  isMerchantMembershipPointsEnabled: PropTypes.bool,
  rewardsAvailableCount: PropTypes.number,
  customerAvailablePointsBalance: PropTypes.number,
  customerCashbackPrice: PropTypes.string,
  onViewMembershipDetailClick: PropTypes.func,
};

Rewards.defaultProps = {
  shouldShowRewardsBanner: false,
  isJoinMembershipNewMember: false,
  isMerchantEnabledCashback: false,
  isMerchantMembershipPointsEnabled: false,
  isMerchantCashbackOrStoreCreditsEnabled: false,
  rewardsAvailableCount: 0,
  customerAvailablePointsBalance: 0,
  customerCashbackPrice: null,
  onViewMembershipDetailClick: () => {},
};

export default connect(state => ({
  shouldShowRewardsBanner: getShouldShowRewardsBanner(state),
  isJoinMembershipNewMember: getIsJoinMembershipNewMember(state),
  isMerchantEnabledCashback: getIsMerchantEnabledCashback(state),
  isMerchantCashbackOrStoreCreditsEnabled: getIsMerchantCashbackOrStoreCreditsEnabled(state),
  isMerchantMembershipPointsEnabled: getIsMerchantMembershipPointsEnabled(state),
  customerAvailablePointsBalance: getCustomerAvailablePointsBalance(state),
  rewardsAvailableCount: getCustomerRewardsTotal(state),
  customerCashbackPrice: getCustomerCashbackPrice(state),
}))(Rewards);
