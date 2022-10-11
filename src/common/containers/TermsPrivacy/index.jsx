import React, { Component } from 'react';
import propTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import DocumentHeadInfo from '../../../components/DocumentHeadInfo';

import '../../../Common.scss';
import Utils from '../../../utils/utils';
import HybridHeader from '../../../components/HybridHeader';
import { getFiles } from './api-request';
import './TermsPrivacy.scss';
import logger from '../../../utils/monitoring/logger';

const PAGE_NAMES = {
  TERMS: 'terms',
  PRIVACY: 'privacy',
};

export class TermsPrivacy extends Component {
  // remove fixed style in beepit.com
  constructor(props) {
    super(props);
    if (Utils.getUserAgentInfo().browser.includes('Safari')) {
      document.body.style.position = '';
      document.body.style.overflow = '';
    }

    this.state = {
      termsPrivacyData: null,
    };
  }

  async componentDidMount() {
    const { pageName } = this.props;

    const data = await getFiles(pageName).catch(error => {
      logger.error('Site_TermsPrivacy_LoadFileFailed', error);
    });

    this.setState({ termsPrivacyData: data });
  }

  getHeaderTitle() {
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

TermsPrivacy.propTypes = {
  pageName: propTypes.string,
};

TermsPrivacy.defaultProps = {
  pageName: '',
};

export default withTranslation()(TermsPrivacy);
