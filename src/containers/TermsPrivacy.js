import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import config from '../config';
import DocumentHeadInfo from '../components/DocumentHeadInfo';

import '../Common.scss';
import Utils from '../utils/utils';

// Example1 URL: http://nike.storehub.local:3000/#/terms-conditions
// Example1 URL: http://nike.storehub.local:3000/#/privacy

export class TermsPrivacy extends Component {
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

  async componentWillMount() {
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
      .then(fileData => {
        // data就是我们请求的repos
        return fileData;
      })
      .catch(error => {
        return Promise.reject(error);
      });

    this.setState({ termsPrivacyData: data });
  }

  render() {
    const { t } = this.props;
    const { termsPrivacyData } = this.state;
    const content = { __html: termsPrivacyData };

    return (
      <DocumentHeadInfo title={t('StoreHubBeep')}>
        <div dangerouslySetInnerHTML={content} />
      </DocumentHeadInfo>
    );
  }
}

export default withTranslation()(TermsPrivacy);
