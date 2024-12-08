import React, { useMemo } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import Constants from '../utils/constants';
import config from '../config';

const { TERMS_OF_USE, PRIVACY } = Constants.ROUTER_PATHS;
const officialUrl = config.beepitComUrl;
const TERMS_OF_USE_FULL_URL = `${officialUrl}${TERMS_OF_USE}`;
const PRIVACY_FULL_URL = `${officialUrl}${PRIVACY}`;
const buttonLinkClassList = ['button button__link text-weight-bolder'];

const TermsAndPrivacy = ({ buttonLinkClassName, termsOfUseDataHeapName, privacyPolicyDataHeapName }) => {
  const linkClassName = useMemo(() => {
    if (buttonLinkClassName) {
      buttonLinkClassList.push(buttonLinkClassName);
    }
    return buttonLinkClassList.join(' ');
  }, [buttonLinkClassName]);

  return (
    <Trans i18nKey="TermsAndPrivacyDescription">
      By tapping to continue, you agree to our
      <br />
      <a
        className={linkClassName}
        target="_blank"
        data-test-id={termsOfUseDataHeapName}
        href={TERMS_OF_USE_FULL_URL}
        rel="noreferrer"
      >
        Terms of Service
      </a>
      and{' '}
      <a
        className={linkClassName}
        target="_blank"
        data-test-id={privacyPolicyDataHeapName}
        href={PRIVACY_FULL_URL}
        rel="noreferrer"
      >
        Privacy Policy
      </a>
      .
    </Trans>
  );
};

TermsAndPrivacy.displayName = 'TermsAndPrivacy';

TermsAndPrivacy.propTypes = {
  buttonLinkClassName: PropTypes.string,
  termsOfUseDataHeapName: PropTypes.string,
  privacyPolicyDataHeapName: PropTypes.string,
};

TermsAndPrivacy.defaultProps = {
  buttonLinkClassName: '',
  termsOfUseDataHeapName: '',
  privacyPolicyDataHeapName: '',
};

export default withTranslation()(TermsAndPrivacy);
