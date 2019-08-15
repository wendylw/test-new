import React, { Component } from 'react';

import config from '../config';
import api from '../cashback/utils/api';
import DocumentTitle from '../views/components/DocumentTitle';

import '../Common.scss';

// Example1 URL: http://nike.storehub.local:3000/#/terms-conditions
// Example1 URL: http://nike.storehub.local:3000/#/privacy

export class TermsPrivacy extends Component {
	state = {
		termsPrivacyData: null,
	}

	async componentWillMount() {
		const { pageName } = this.props;

		const data = await api({
			url: '/api/privacy',
			method: 'get',
			params: {
				filePath: config.termsPrivacyURLS[pageName]
			}
		});

		this.setState({ termsPrivacyData: data });
	}

	render() {
		const { termsPrivacyData } = this.state;
		const content = { __html: termsPrivacyData };

		return (
			<DocumentTitle title={''}>
				<div dangerouslySetInnerHTML={content} />
			</DocumentTitle>
		)
	}
}

export default TermsPrivacy;
