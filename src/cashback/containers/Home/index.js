import React from 'react';

import Image from '../../../components/Image';
import Message from '../../components/Message';
import RedeemModal from './components/RedeemModal';
import RecentActivities from './components/RecentActivities';
import CurrencyNumber from '../../components/CurrencyNumber';

import qs from 'qs';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActions, getOnlineStoreInfo } from '../../redux/modules/app';
import { actions as homeActions, getBusinessInfo, getCashbackHistory, getCashbackHistorySummary } from '../../redux/modules/home';


class PageLoyalty extends React.Component {
	state = {
		showModal: false,
	}

	setMessage(cashbackHistorySummary) {
		const { appActions } = this.props;
		const { status } = cashbackHistorySummary || {};

		appActions.showMessageInfo({ key: status });
	}

	async componentWillMount() {
		const {
			history,
			homeActions,
		} = this.props;
		const { customerId = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

		await homeActions.setCustomerId(customerId);
		homeActions.setCashbackMessage();
	}

	componentDidMount() {
		this.setMessage(this.props.cashbackHistorySummary);
	}

	componentWillReceiveProps(nextProps) {
		const { cashbackHistorySummary } = nextProps;
		const { status } = cashbackHistorySummary || {};
		const { status: preCashbackStatus } = this.props.cashbackHistorySummary || {};

		if (status !== preCashbackStatus) {
			this.setMessage(cashbackHistorySummary);
		}
	}

	renderMessage() {
		const {
			homeActions,
			cashbackHistorySummary,
		} = this.props;
		const { status } = cashbackHistorySummary || {};

		return (
			<Message
				status={status}
				clearMessage={() => homeActions.clearCashbackMessage()}
			/>
		);
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
				{this.renderMessage()}
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
		businessInfo: getBusinessInfo(state),
		cashbackHistory: getCashbackHistory(state),
		cashbackHistorySummary: getCashbackHistorySummary(state)
	}),
	(dispatch) => ({
		appActions: bindActionCreators(appActions, dispatch),
		homeActions: bindActionCreators(homeActions, dispatch),
	})
)(PageLoyalty);
