import React from 'react';
import { BrowserRouter, Link } from 'react-router-dom';
import Constants from '../utils/constants';

export class TermsAndPrivacyLinks extends React.Component {
	render() {
		return (
			<BrowserRouter basename="/">
				<Link target="_blank" to={Constants.ROUTER_PATHS.TERMS_OF_USE}><strong>Terms of Service</strong></Link>, and <Link target="_blank" to={Constants.ROUTER_PATHS.PRIVACY}><strong>Privacy Policy</strong></Link>.
			</BrowserRouter>
		);
	}
}