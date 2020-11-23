import React from 'react';
import { BrowserRouter, Link } from 'react-router-dom';
import { withTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import Constants from '../utils/constants';

export class TermsAndPrivacy extends React.Component {
  render() {
    const { buttonLinkClassName, baseName } = this.props;
    const buttonLinkClassList = ['button button__link text-weight-bolder'];

    if (buttonLinkClassName) {
      buttonLinkClassList.push(buttonLinkClassName);
    }

    return (
      <BrowserRouter basename={baseName}>
        <Trans i18nKey="TermsAndPrivacyDescription">
          By tapping to continue, you agree to our
          <br />
          <Link
            className={buttonLinkClassList.join(' ')}
            target="_blank"
            data-heap-name="ordering.common.login.term-link"
            to={Constants.ROUTER_PATHS.TERMS_OF_USE}
          >
            Terms of Service
          </Link>
          , and{' '}
          <Link
            className={buttonLinkClassList.join(' ')}
            target="_blank"
            data-heap-name="ordering.common.login.privacy-policy-link"
            to={Constants.ROUTER_PATHS.PRIVACY}
          >
            Privacy Policy
          </Link>
          .
        </Trans>
      </BrowserRouter>
    );
  }
}

TermsAndPrivacy.propTypes = {
  buttonLinkClassName: PropTypes.string,
  baseName: PropTypes.string,
};

TermsAndPrivacy.defaultProps = {
  baseName: '/',
};

export default withTranslation()(TermsAndPrivacy);
