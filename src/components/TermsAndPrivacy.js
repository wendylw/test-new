import React from 'react';
import { BrowserRouter, Link } from 'react-router-dom';
import Constants from '../utils/constants';

export class TermsAndPrivacyLinks extends React.Component {
  render() {
    return (
      <BrowserRouter basename="/">
        <Link target="_blank" to={Constants.ROUTER_PATHS.TERMS_OF_USE} data-heap-name="common.terms-and-privacy.terms">
          <strong>Terms of Service</strong>
        </Link>
        , and{' '}
        <Link target="_blank" to={Constants.ROUTER_PATHS.PRIVACY} data-heap-name="common.terms-and-privacy.privacy">
          <strong>Privacy Policy</strong>
        </Link>
        .
      </BrowserRouter>
    );
  }
}
