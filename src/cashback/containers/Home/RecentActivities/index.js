import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import { getCashbackHistory } from '../../actions';
import { IconPending, IconChecked, IconEarned } from '../../../../components/Icons';
import CurrencyNumber from '../../../components/CurrencyNumber';

class RecentActivities extends React.Component {
	state = {
		fullScreen: false,
	}

	toggleFullScreen() {
		this.setState({ fullScreen: !this.state.fullScreen });
	}

	async fetch() {
		const { customerId, history } = this.props;

		if (!customerId) {
			console.error(new Error('custom id is required in RecentActivityView'));
			// this.props.sendMessage({
			// 	errorStatus: 'Activity_Incorrect',
			// });
			// history.push('/');
			return;
		}

		try {
			// await getCashbackHistory({ customerId });
		} catch (e) {
			console.error(e);
		} finally {
		}
	}

	componentWillMount() {
		this.fetch();
	}

	renderEventType(eventType) {
		const eventTypesMap = {
			pending: "Cashback Pending",
			/* expense is same as redeemed */
			expense: "Redeemed",
			earned: "You earned",
		};

		return eventTypesMap[eventType] || eventType;
	}

	renderIcon(eventType, props) {
		const eventTypesMap = {
			pending: IconPending,
			expense: IconChecked,
			earned: IconEarned,
		};

		const IconComponent = eventTypesMap[eventType];

		if (!IconComponent) return null;

		return (
			<IconComponent {...props} />
		);
	}

	renderEventTime(eventTime) {
		// const { onlineStoreInfo: { locale } = {} } = this.props || {};
		const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
		const eventDateTime = new Date(Number.parseInt(eventTime, 10));
		const locale = 'en'; // use English by now.

		if (locale) {
			return eventDateTime.toLocaleDateString(locale, dateOptions);
		}

		return eventDateTime.toDateString(dateOptions);
	}

	render() {
		const { cashbackHistory, customerId } = this.props;
		const { logs } = cashbackHistory || {};

		if (!Array.isArray(logs) || !customerId) {
			return null;
		}

		return (
			<section className={`asdie-section ${this.state.fullScreen ? 'full' : ''}`}>
				<aside className="aside-bottom">
					{
						!this.state.fullScreen ? (
							<i className="aside-bottom__slide-button" onClick={this.toggleFullScreen.bind(this)}></i>
						) : (
								<header className="header border__bottom-divider flex flex-middle flex-space-between">
									<figure
										className="header__image-container text-middle"
										onClick={this.toggleFullScreen.bind(this)}
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
											<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
											<path d="M0 0h24v24H0z" fill="none" />
										</svg>
									</figure>
								</header>
							)
					}
					<h3 className="aside-bottom__title text-center" onClick={this.toggleFullScreen.bind(this)}>Recent Activity</h3>
					<div className="activity">
						{
							logs.map((activity, i) => (
								<div key={`${i}`} className="activity__item flex flex-middle">
									{this.renderIcon(activity.eventType, { className: 'activity__icon' })}
									<summary>
										<h4 className="activity__title">
											<label>{this.renderEventType(activity.eventType)}&nbsp;</label>
											{
												activity.eventType !== 'pending'
													? <CurrencyNumber money={Math.abs(activity.amount || 0)} />
													: null
											}
										</h4>
										<time className="activity__time">{this.renderEventTime(activity.eventTime)}</time>
									</summary>
								</div>
							))
						}
					</div>
				</aside>
			</section>
		);
	}
}

const mapStateToProps = () => ({});

const mapDispathToProps = dispatch => bindActionCreators({
	// getCashbackHistory,
}, dispatch);

export default connect(mapStateToProps, mapDispathToProps)(RecentActivities);