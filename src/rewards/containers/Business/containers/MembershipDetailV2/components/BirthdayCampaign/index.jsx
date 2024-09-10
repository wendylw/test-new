import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CaretRight } from 'phosphor-react';
import BirthdayCakeImage from '../../../../../../../images/rewards-birthday-cake.svg';
import { getIsBirthdayCampaignEntryShow } from '../../redux/selectors';
import { showProfileForm } from '../../redux/thunks';
import Button from '../../../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './BirthdayCampaign.module.scss';

const BirthdayCampaign = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const isBirthdayCampaignEntryShow = useSelector(getIsBirthdayCampaignEntryShow);
  const handleClickBirthdayCampaignButton = useCallback(() => dispatch(showProfileForm({ hideSkipButton: false })), [
    dispatch,
  ]);

  if (!isBirthdayCampaignEntryShow) {
    return null;
  }

  return (
    <section className={styles.BirthdayCampaignSection}>
      <Button
        data-test-id="rewards.business.membership-detail.birthday-campaign-button"
        block
        type="text"
        theme="ghost"
        className={styles.BirthdayCampaignButton}
        contentClassName={styles.BirthdayCampaignButtonContent}
        onClick={handleClickBirthdayCampaignButton}
      >
        <div className={styles.BirthdayCampaignImageContainer}>
          <ObjectFitImage noCompression className={styles.BirthdayCampaignImage} src={BirthdayCakeImage} />
        </div>
        <div className={styles.BirthdayCampaignTexts}>
          <h4 className={styles.BirthdayCampaignTitle}>{t('BirthdayCampaignTitle')}</h4>
          <p>{t('BirthdayCampaignDescription')}</p>
        </div>
        <CaretRight size={32} weight="thin" />
      </Button>
    </section>
  );
};

BirthdayCampaign.displayName = 'BirthdayCampaign';

export default BirthdayCampaign;
