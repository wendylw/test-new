import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CaretRight } from 'phosphor-react';
import BirthdayCakeImage from '../../../../../../../images/rewards-birthday-cake.svg';
import { getIsWebview } from '../../../../../../redux/modules/common/selectors';
import { getIsBirthdayCampaignEntryShow, getIsProfileModalShow } from '../../redux/selectors';
import { showWebProfileForm, hideWebProfileForm } from '../../redux/thunks';
import Button from '../../../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import Profile from '../../../../../Profile';
import styles from './BirthdayCampaign.module.scss';

const BirthdayCampaign = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const isWebview = useSelector(getIsWebview);
  const isProfileModalShow = useSelector(getIsProfileModalShow);
  const isBirthdayCampaignEntryShow = useSelector(getIsBirthdayCampaignEntryShow);
  const handleClickBirthdayCampaignButton = useCallback(() => dispatch(showWebProfileForm()), [dispatch]);
  const handleClickSkipProfileButton = useCallback(() => dispatch(hideWebProfileForm()), [dispatch]);
  const handleClickSaveProfileButton = useCallback(() => dispatch(hideWebProfileForm()), [dispatch]);

  if (!isBirthdayCampaignEntryShow) {
    return null;
  }

  return (
    <>
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
      {/* TODO: Migrate to membership detail component next phase */}
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

BirthdayCampaign.displayName = 'BirthdayCampaign';

export default BirthdayCampaign;
