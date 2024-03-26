import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import Button from '../../../../../../../common/components/Button';
import PageFooter from '../../../../../../../common/components/PageFooter';
import { getShouldShowFooter, getShouldDisableJoinNowButton } from '../../redux/selectors';
import { joinNowButtonClicked } from '../../redux/thunks';
import { TERMS_AND_CONDITION_URL } from '../../constants';

const Footer = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('Rewards');
  const isJoinNowButtonDisabled = useSelector(getShouldDisableJoinNowButton);
  const handleClickJoinNowButton = useCallback(() => dispatch(joinNowButtonClicked()), [dispatch]);
  const shouldShowFooter = useSelector(getShouldShowFooter);

  if (!shouldShowFooter) {
    return null;
  }

  return (
    <PageFooter className="tw-shadow-xl">
      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-8 sm:tw-py-8px tw-px-16 sm:tw-px-16px">
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
        <Button
          block
          type="primary"
          data-test-id="rewards.business.membership-form.join-btn"
          className="tw-uppercase"
          disabled={isJoinNowButtonDisabled}
          onClick={handleClickJoinNowButton}
        >
          {t('JoinNow')}
        </Button>
      </div>
    </PageFooter>
  );
};

Footer.displayName = 'Footer';

export default Footer;
