import React from 'react';

import Image from '../../../components/Image';
import RedeemModal from './components/RedeemModal';
import RecentActivities from './components/RecentActivities';
import CurrencyNumber from '../../components/CurrencyNumber';

import qs from 'qs';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActions, getOnlineStoreInfo, getBusiness } from '../../redux/modules/app';
import { actions as homeActions, getCashbackHistory, getCashbackHistorySummary } from '../../redux/modules/home';


class PageLoyalty extends React.Component {
	state = {
		showModal: false,
	}

	async componentWillMount() {
		const {
			history,
			appActions,
			homeActions,
		} = this.props;
		const { customerId = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

		await homeActions.setCustomerId(customerId);
		await appActions.setCashbackMessage();
		appActions.showMessageInfo();
	}

	render() {
		const {
			business,
			onlineStoreInfo,
			cashbackHistory,
		} = this.props;
		const {
			displayBusinessName,
			name,
		} = business || {};
		const { logo } = onlineStoreInfo || {};
		const { totalCredits } = cashbackHistory || {};

		return (
			<section className="loyalty__home">
				<div className="loyalty__content text-center">
					{
						logo ? (
							<Image className="logo-default__image-container" src={logo} alt={displayBusinessName || name} />
						) : null
					}
					<h5 className="logo-default__title text-uppercase">Total cashback</h5>
					<CurrencyNumber className="loyalty__money" money={totalCredits || 0} />
					<div className="redeem__button-container">
						<button className="redeem__button button__outline button__block border-radius-base font-weight-bold text-uppercase" onClick={() => this.setState({ showModal: true })}>How to use Cashback?</button>
						<RedeemModal
							show={this.state.showModal}
							onClose={() => this.setState({ showModal: false })}
						/>
					</div>
				</div>
				<RecentActivities />
			</section>
		);
	}
}

export default connect(
	(state) => ({
		onlineStoreInfo: getOnlineStoreInfo(state),
		business: getBusiness(state),
		cashbackHistory: getCashbackHistory(state),
		cashbackHistorySummary: getCashbackHistorySummary(state)
	}),
	(dispatch) => ({
		appActions: bindActionCreators(appActions, dispatch),
		homeActions: bindActionCreators(homeActions, dispatch),
	})
)(PageLoyalty);
