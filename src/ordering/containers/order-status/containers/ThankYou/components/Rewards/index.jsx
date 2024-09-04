import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { CaretRight } from 'phosphor-react';
import RewardsIcon from '../../../../../../../images/rewards-icon-rewards.svg';
import Button from '../../../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
// import RewardsPointsIcon from '../../../../../../../images/rewards-icon-points.svg';
// import RewardsCashbackIcon from '../../../../../../../images/rewards-icon-cashback.svg';
// import RewardsStoreCreditsIcon from '../../../../../../../images/rewards-icon-store-credits.svg';
import './Rewards.scss';

const Rewards = ({ isNewMember }) => {
  const { t } = useTranslation('OrderingThankYou');

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
        <div>
          <h3>{isNewMember ? t('RewardsCardNewMemberTitle') : t('RewardsCardReturningMemberTitle')}</h3>
          <a href="https://beepit.com">Check Balance</a>
        </div>
        <ul>
          <li>
            <img src="" alt="" />
            <span>3 Rewards</span>
          </li>
          <li>
            <img src="" alt="" />
            <span>200 Points</span>
          </li>
          <li>
            <img src="" alt="" />
            <span>RM 1.23 Cashback</span>
          </li>
        </ul>
      </section>
    </>
  );
};

Rewards.displayName = 'RewardsCard';

Rewards.propTypes = {
  isNewMember: PropTypes.bool,
};

Rewards.defaultProps = {
  isNewMember: false,
};

export default Rewards;
