import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Button from '../../../../../common/components/Button';
import PageHeader from '../../../../../common/components/PageHeader';
import PageFooter from '../../../../../common/components/PageFooter';
import { getShouldShowBackButton } from './redux/selectors';
import styles from './MembershipForm.module.scss';

const MembershipForm = () => {
  const { t } = useTranslation('Rewards');
  const shouldShowBackButton = useSelector(getShouldShowBackButton);

  return (
    <section>
      <PageHeader title={t('JoinOurMembership')} isShowBackButton={shouldShowBackButton} />
      <PageFooter className="tw-shadow-xl">
        <div className={styles.MembershipFormFooter}>
          <Button
            block
            type="primary"
            data-test-id="rewards.business.membership-form.join-btn"
            className="tw-uppercase"
          >
            {t('JoinNow')}
          </Button>
        </div>
      </PageFooter>
    </section>
  );
};

MembershipForm.displayName = 'MembershipForm';

export default MembershipForm;
