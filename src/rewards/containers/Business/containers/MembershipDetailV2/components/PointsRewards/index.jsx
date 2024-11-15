import React, { useCallback, useMemo } from 'react';
import { useWindowSize } from 'react-use';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { CaretRight } from 'phosphor-react';
import RewardsPointsIcon from '../../../../../../../images/rewards-icon-points.svg';
import { DESKTOP_PAGE_WIDTH, PATH_NAME_MAPPING } from '../../../../../../../common/utils/constants';
import { POINTS_REWARD_WIDTHS } from '../../utils/constants';
import { getClassName } from '../../../../../../../common/utils/ui';
import CleverTap from '../../../../../../../utils/clevertap';
import { getLocationSearch } from '../../../../../../redux/modules/common/selectors';
import { getIsPointsRewardListShown } from '../../../../redux/common/selectors';
import { getMembershipDetailPointsRewardList, getIsPointsRewardListMoreButtonShown } from '../../redux/selectors';
import Button from '../../../../../../../common/components/Button';
import Slider from '../../../../../../../common/components/Slider';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import Tag from '../../../../../../../common/components/Tag';
import Ticket from '../../../../../../../common/components/Ticket';
import styles from './PointsRewards.module.scss';

const MORE_BUTTON_WIDTH = '57px';
const MORE_BUTTON_SLIDE_STYLE = {
  minWidth: MORE_BUTTON_WIDTH,
  maxWidth: MORE_BUTTON_WIDTH,
  width: MORE_BUTTON_WIDTH,
};

const getTicketWidth = windowWidth => {
  if (!windowWidth) {
    return POINTS_REWARD_WIDTHS.MIN_WIDTH;
  }

  // DESKTOP_PAGE_WIDTH is desktop page width
  const pageWidth = windowWidth > DESKTOP_PAGE_WIDTH ? DESKTOP_PAGE_WIDTH : windowWidth;
  // one ticket base on design is 2 / 3
  const ticketWidth = (pageWidth * (2 / 3)).toFixed(2);

  return ticketWidth > POINTS_REWARD_WIDTHS.MAX_WIDTH ? POINTS_REWARD_WIDTHS.MAX_WIDTH : ticketWidth;
};

const PointsRewards = () => {
  const { t } = useTranslation(['Rewards']);
  const { width } = useWindowSize();
  const history = useHistory();
  const membershipDetailPointsRewardList = useSelector(getMembershipDetailPointsRewardList);
  const isPointsRewardListMoreButtonShown = useSelector(getIsPointsRewardListMoreButtonShown);
  const isPointsRewardListShown = useSelector(getIsPointsRewardListShown);
  const search = useSelector(getLocationSearch);
  const ticketWidth = useMemo(() => getTicketWidth(width), [width]);
  const goToPointsRewardsListPage = useCallback(() => {
    CleverTap.pushEvent('Membership Details Page - Click View All (Get Rewards Section)');

    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.POINTS_REWARDS}${PATH_NAME_MAPPING.LIST}`,
      search,
    });
  }, [history, search]);
  const handleClickRewardItem = useCallback(
    rewardSettingId => {
      const pointsRewardDetail = {
        pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.POINTS_REWARDS}${PATH_NAME_MAPPING.DETAIL}`,
        search: `${search || '?'}&rewardSettingId=${rewardSettingId}`,
      };

      CleverTap.pushEvent('Membership Details Page - Click Points Reward');

      history.push(pointsRewardDetail);
    },
    [history, search]
  );
  const slideProps = {
    mode: 'free-snap',
    perView: 'auto',
    spacing: 15,
    slideStyle: {
      minWidth: `${ticketWidth}px`,
      maxWidth: `${ticketWidth}px`,
      width: `${ticketWidth}px`,
    },
  };
  const pointsRewardListElements = useMemo(
    () =>
      membershipDetailPointsRewardList.map(pointsReward => {
        const { id, isSoldOut, isExpired, name, costOfPoints, rewardSettingId, isUnavailable } = pointsReward;

        return (
          <Button
            key={id}
            type="text"
            theme="ghost"
            data-test-id="rewards.business.membership-detail.points-rewards.reward"
            className={styles.PointsRewardsTicketButton}
            contentClassName={styles.PointsRewardsTicketButtonContent}
            onClick={() => {
              handleClickRewardItem(rewardSettingId);
            }}
          >
            <Ticket
              className={styles.PointsRewardsTicket}
              main={
                <div className={styles.PointsRewardsTicketMain}>
                  <h3 className={styles.PointsRewardsTicketMainTitle}>{name}</h3>
                  <div className={styles.PointsRewardsTicketMainContent}>
                    <data
                      value={costOfPoints}
                      className={getClassName([
                        styles.PointsRewardsClaimedPointsContainer,
                        isUnavailable ? styles.PointsRewardsClaimedPointsContainer__unavailable : null,
                      ])}
                    >
                      <div className={styles.PointsRewardsPointsIconContainer}>
                        <ObjectFitImage noCompression src={RewardsPointsIcon} />
                      </div>
                      {t('RewardsCostOfPointsText', { costOfPoints })}
                    </data>
                    {isSoldOut || isExpired ? (
                      <Tag className={styles.PointsRewardsTicketMainStatusTag}>
                        {isExpired ? t('Expired') : t('SoldOut')}
                      </Tag>
                    ) : null}
                  </div>
                </div>
              }
            />
          </Button>
        );
      }),
    [handleClickRewardItem, membershipDetailPointsRewardList, t]
  );

  if (!isPointsRewardListShown) {
    return null;
  }

  return (
    <section className={styles.PointsRewardsSection}>
      <div className={styles.PointsRewardsSectionTopContainer}>
        <h2 className={styles.PointsRewardsSectionTitle}>{t('GetRewards')}</h2>
        <Button
          type="text"
          size="small"
          theme="info"
          className={styles.PointsRewardsSectionViewAllButton}
          contentClassName={styles.PointsRewardsSectionViewAllButtonContent}
          data-test-id="rewards.business.membership-detail.get-rewards.view-all-button"
          onClick={goToPointsRewardsListPage}
        >
          {t('ViewAll')}
        </Button>
      </div>
      <div className={styles.PointsRewardsContentContainer}>
        {/*
            Two sliders separate for no rendering a extra empty slide,
            if isPointsRewardListMoreButtonShown inside Slider will happen this issue
          */}
        {isPointsRewardListMoreButtonShown ? (
          <Slider
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...slideProps}
            afterAddonSlide={{
              style: MORE_BUTTON_SLIDE_STYLE,
              content: (
                <Button
                  type="text"
                  theme="ghost"
                  className={styles.PointsRewardsMoreButton}
                  data-test-id="rewards.business.membership-detail.get-rewards.more-button"
                  onClick={goToPointsRewardsListPage}
                >
                  <i className={styles.PointsRewardsMoreButtonIcon}>
                    <CaretRight size={24} />
                  </i>
                  <span className={styles.PointsRewardsMoreButtonText}>{t('More')}</span>
                </Button>
              ),
            }}
          >
            {pointsRewardListElements}
          </Slider>
        ) : (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <Slider {...slideProps}>{pointsRewardListElements}</Slider>
        )}
      </div>
    </section>
  );
};

PointsRewards.displayName = 'PointsRewards';

export default PointsRewards;
