import React from 'react';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import {
	IconPending,
	IconChecked,
	IconEarned,
} from '../../../../../components/Icons';
import Header from '../../../../../components/Header';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOnlineStoreInfo } from '../../../../redux/modules/app';
import { actions as homeActions, getCustomerId, getCashbackHistory } from '../../../../redux/modules/home';

const LANGUAGES = {
	MY: 'EN',
	TH: 'EN',
	PH: 'EN',
};
const DATE_OPTIONS = {
	weekday: 'short',
	year: 'numeric',
	month: 'short',
	day: 'numeric',
};

class RecentActivities extends React.Component {
	state = {
		fullScreen: false,
	}

	toggleFullScreen() {
		this.setState({ fullScreen: !this.state.fullScreen });
	}

	getType(type, props) {
		const TypesMap = {
			pending: {
				text: 'Cashback Pending',
				icon: <IconPending {...props} />,
			},
			/* expense is same as redeemed */
			expense: {
				text: 'Redeemed',
				icon: <IconChecked {...props} />,
			},
			earned: {
				text: 'You earned',
				icon: <IconEarned {...props} />,
			},
		};

		return TypesMap[type];
	}

	componentWillMount() {
		const { homeActions, customerId } = this.props;

		if (customerId) {
			homeActions.getCashbackHistory(customerId);
		}
	}

	renderLogList() {
		const {
			cashbackHistory,
			onlineStoreInfo,
		} = this.props;
		const { logs } = cashbackHistory || {};
		const { country } = onlineStoreInfo || {};

		return (
			<ul className="activity">
				{
					(logs || []).map((activity, i) => {
						const {
							eventType,
							eventTime,
						} = activity;
						const eventDateTime = new Date(Number.parseInt(eventTime, 10));
						const type = this.getType(eventType, { className: 'activity__icon' });

						return (
							<li key={`${i}`} className="activity__item flex flex-middle">
								{type.icon}
								<summary>
									<h4 className="activity__title">
										<label>{type.text}&nbsp;</label>
										{
											activity.eventType !== 'pending'
												? <CurrencyNumber money={Math.abs(activity.amount || 0)} />
												: null
										}
									</h4>
									<time className="activity__time">
										{eventDateTime.toLocaleDateString(LANGUAGES(country || 'MY'), DATE_OPTIONS)}
									</time>
								</summary>
							</li>
						);
					})
				}
			</ul>
		);
	}

	render() {
		const { cashbackHistory, customerId } = this.props;
		const { logs } = cashbackHistory || {};

		if (!Array.isArray(logs) || !customerId) {
			return null;
		}

		return (
			<div className={`asdie-section ${this.state.fullScreen ? 'full' : ''}`}>
				<aside className="aside-bottom">
					{
						!this.state.fullScreen
							? <i className="aside-bottom__slide-button" onClick={this.toggleFullScreen.bind(this)}></i>
							: <Header navFunc={this.toggleFullScreen.bind(this)} />
					}
					<h3 className="aside-bottom__title text-center" onClick={this.toggleFullScreen.bind(this)}>Recent Activity</h3>
					{this.renderLogList()}
				</aside>
			</div>
		);
	}
}

export default connect(
	(state) => ({
		onlineStoreInfo: getOnlineStoreInfo(state),
		customerId: getCustomerId(state),
		cashbackHistory: getCashbackHistory(state),
	}),
	(dispatch) => ({
		homeActions: bindActionCreators(homeActions, dispatch),
	})
)(RecentActivities);