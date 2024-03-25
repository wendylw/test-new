import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getClassName } from '../../../../../../../common/utils/ui';
import CleverTap from '../../../../../../../utils/clevertap';
import PointsRewardClaimedIcon from '../../../../../../../images/rewards-points-claimed.svg';
import { getIsWebview } from '../../../../../../redux/modules/common/selectors';
import {
  getPointsRewardList,
  getIsPointsRewardListShown,
  getIsClaimPointsRewardLoaderShow,
  getIsProfileModalShow,
  getIsClaimPointsRewardSuccessfulAlertShow,
} from '../../redux/selectors';
import { pointsClaimRewardButtonClicked, skipProfileButtonClicked, saveProfileButtonClicked } from '../../redux/thunks';
import { alert, confirm } from '../../../../../../../common/utils/feedback';
import PageToast from '../../../../../../../common/components/PageToast';
import Loader from '../../../../../../../common/components/Loader';
import Button from '../../../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import Profile from '../../../../../Profile';
import styles from './PointsRewardList.module.scss';

const PointsRewardList = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['Rewards']);
  const isWebview = useSelector(getIsWebview);
  const pointsRewardList = useSelector(getPointsRewardList);
  const isPointsRewardListShown = useSelector(getIsPointsRewardListShown);
  const isClaimPointsRewardLoaderShow = useSelector(getIsClaimPointsRewardLoaderShow);
  const isProfileModalShow = useSelector(getIsProfileModalShow);
  const isClaimPointsRewardSuccessfulAlertShow = useSelector(getIsClaimPointsRewardSuccessfulAlertShow);
  const handlePointsClaimRewardButtonClick = (id, type, costOfPoints) => {
    confirm('', {
      className: styles.PointsRewardConfirm,
      title: t('RewardsCostOfPointsConfirmMessage', { costOfPoints }),
      cancelButtonContent: t('Cancel'),
      confirmButtonContent: t('Confirm'),
      onSelection: async status => {
        if (status) {
          CleverTap.pushEvent('Points Reward Claimed - Click confirm', {
            type,
            costOfPoints,
          });
          dispatch(pointsClaimRewardButtonClicked({ id, type }));
        } else {
          CleverTap.pushEvent('Points Reward Claimed - Click cancel', {
            type,
            costOfPoints,
          });
        }
      },
    });
  };
  const handleClickSkipProfileButton = (id, type) => dispatch(skipProfileButtonClicked({ id, type }));
  const handleClickSaveProfileButton = (id, type) => dispatch(saveProfileButtonClicked({ id, type }));

  useEffect(() => {
    if (isClaimPointsRewardSuccessfulAlertShow) {
      alert(
        <div className={styles.PointsRewardClaimedAlertContent}>
          <div className={styles.PointsRewardClaimedAlertIcon}>
            <ObjectFitImage
              noCompression
              src={PointsRewardClaimedIcon}
              alt="Points Reward Claimed Successful Icon in StoreHub"
            />
          </div>
          <h4 className={styles.PointsRewardClaimedAlertTitle}>{t('PointsRewardClaimedTitle')}</h4>
          <p className={styles.PointsRewardClaimedAlertDescription}>{t('PointsRewardClaimedDescription')}</p>
        </div>,
        { id: 'PointsRewardClaimedSuccessfulAlert' }
      );
    }
  }, [t, isClaimPointsRewardSuccessfulAlertShow]);

  if (!isPointsRewardListShown) {
    return null;
  }

  return (
    <>
      <section className={styles.PointsRewardListSection}>
        <h2 className={styles.PointsRewardListSectionTitle}>{t('GetRewards')}</h2>
        <ul className={styles.PointsRewardList}>
          {pointsRewardList.map(pointsReward => {
            const { id, type, value, name, costOfPoints, isUnavailable } = pointsReward;
            const pointsRewardInfoLeftClassName = getClassName([
              styles.PointsRewardInfoLeft,
              isUnavailable ? styles.PointsRewardInfoLeft__Unavailable : null,
            ]);
            const pointsRewardInfoRightClassName = getClassName([
              styles.PointsRewardInfoRight,
              isUnavailable ? styles.PointsRewardInfoRight__Unavailable : null,
            ]);

            return (
              <li className={styles.PointsRewardCard} key={id}>
                <div className={pointsRewardInfoLeftClassName}>
                  <data className={styles.PointsRewardDiscount} value={value}>
                    {t('DiscountValueText', { discount: value })}
                  </data>
                  <h5 className={styles.PointsRewardDiscountName}>{name}</h5>
                </div>
                <div className={pointsRewardInfoRightClassName}>
                  <Button
                    data-test-id="rewards.membership-detail.points-claim-reward-button"
                    theme="ghost"
                    type="secondary"
                    size="small"
                    className={styles.PointsRewardConstButton}
                    contentClassName={styles.PointsRewardConstButtonContent}
                    disabled={isUnavailable}
                    onClick={() => {
                      handlePointsClaimRewardButtonClick(id, type, costOfPoints);
                    }}
                  >
                    {t('RewardsCostOfPointsText', { costOfPoints })}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      {isClaimPointsRewardLoaderShow && (
        <PageToast icon={<Loader className="tw-m-8 sm:tw-m-8px" size={30} />}>{`${t('Processing')}...`}</PageToast>
      )}
      {!isWebview && (
        <Profile
          show={isProfileModalShow}
          onSave={handleClickSaveProfileButton}
          onSkip={handleClickSkipProfileButton}
        />
      )}
    </>
  );
};

PointsRewardList.displayName = 'PointsRewardList';

export default PointsRewardList;
