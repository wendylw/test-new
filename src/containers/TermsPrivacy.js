import React, { Component } from 'react';

import config from '../config';
import api from '../utils/api';
import DocumentTitle from '../components/DocumentTitle';

import '../Common.scss';

// Example1 URL: http://nike.storehub.local:3000/#/terms-conditions
// Example1 URL: http://nike.storehub.local:3000/#/privacy

export class TermsPrivacy extends Component {
	state = {
		termsPrivacyData: null,
	}

	async componentWillMount() {
		const { pageName } = this.props;

		const data = await fetch(`/api/privacy?filePath=${config.termsPrivacyURLS[pageName]}`, {
			method: 'GET',
			mode: 'cors',
			headers: new Headers({
				Accept: "application/json",
				"Content-Type": "application/json",
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
