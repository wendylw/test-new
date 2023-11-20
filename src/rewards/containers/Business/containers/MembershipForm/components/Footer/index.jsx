import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Button from '../../../../../../../common/components/Button';
import PageFooter from '../../../../../../../common/components/PageFooter';
import { TERMS_AND_CONDITION_URL } from '../../constants';

const Footer = () => {
  const { t } = useTranslation('Rewards');

  return (
    <PageFooter className="tw-shadow-xl">
      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-8 sm:tw-p-8px">
        <p className="tw-text-left tw-w-full tw-py-8 sm:tw-py-8px tw-text-sm">
          <Trans i18nKey="TermsAndConditionsDescription">
            By tapping on Join Now, you agree to the &nbsp;
            <a
              className="button button__link text-weight-bolder tw-text-sm tw-text-blue"
              data-test-id="rewards.business.terms-and-condition"
              href={TERMS_AND_CONDITION_URL}
              rel="noreferrer"
            >
              Term & Conditions
            </a>
          </Trans>
        </p>
        <Button block type="primary" data-test-id="rewards.business.membership-form.join-btn" className="tw-uppercase">
          {t('JoinNow')}
        </Button>
      </div>
    </PageFooter>
  );
};

Footer.displayName = 'Footer';

export default Footer;
