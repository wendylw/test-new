import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import config from '../../../config';
import DocumentHeadInfo from '../../../components/DocumentHeadInfo';

import '../../../Common.scss';
import Utils from '../../../utils/utils';
import HybridHeader from '../../../components/HybridHeader';
import './TermsPrivacy.scss';
// Example1 URL: http://nike.storehub.local:3000/#/terms-conditions
// Example1 URL: http://nike.storehub.local:3000/#/privacy

const PAGE_NAMES = {
  TERMS: 'terms',
  PRIVACY: 'privacy',
};

export class TermsPrivacy extends Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    termsPrivacyData: null,
  };

  // remove fixed style in beepit.com
  constructor(props) {
    super(props);
    if (Utils.getUserAgentInfo().browser.includes('Safari')) {
      document.body.style.position = '';
      document.body.style.overflow = '';
    }
  }

  // eslint-disable-next-line react/no-deprecated
  async componentWillMount() {
    // eslint-disable-next-line react/prop-types
    const { pageName } = this.props;

    const data = await fetch(`/api/privacy?filePath=${config.termsPrivacyURLS[pageName]}`, {
      method: 'GET',
      mode: 'cors',
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    })
      .then(response => response.text())
      .then(
        fileData =>
          // data就是我们请求的repos
          fileData
      )
      .catch(error => Promise.reject(error));

    this.setState({ termsPrivacyData: data });
  }

  getHeaderTitle() {
    // eslint-disable-next-line react/prop-types
    const { pageName, t } = this.props;
    if (pageName === PAGE_NAMES.TERMS) {
      return t('TermsOfService');
    }

    if (pageName === PAGE_NAMES.PRIVACY) {
      return t('PrivacyPolicy');
    }

    return window.document.title;
  }

  handleContentClick = event => {
    if (event.target?.nodeName.toLowerCase() === 'a') {
      // block link in beep tng mini program because user can't back this page from third page
      if (Utils.isTNGMiniProgram()) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  };

  render() {
    const { t } = this.props;
    const { termsPrivacyData } = this.state;
    const content = { __html: termsPrivacyData };
    const headerVisible = Utils.isTNGMiniProgram() || Utils.isWebview();

    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <DocumentHeadInfo title={t('Beep')}>
        {headerVisible && <HybridHeader title={this.getHeaderTitle()} />}
        {/* remove link style in tng mini program */}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          className={Utils.isTNGMiniProgram() ? 'terms-privacy__remove-link-style' : ''}
          onClick={this.handleContentClick}
          dangerouslySetInnerHTML={content}
        />
      </DocumentHeadInfo>
    );
  }
}
TermsPrivacy.displayName = 'TermsPrivacy';

export default withTranslation()(TermsPrivacy);
