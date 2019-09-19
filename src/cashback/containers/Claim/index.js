import React from 'react';
import qs from 'qs';
import PhoneViewContainer from './components/PhoneViewContainer';
import CurrencyNumber from '../../components/CurrencyNumber';
import { IconPin } from '../../../components/Icons';
import Image from '../../../components/Image';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOnlineStoreInfo, getUser } from '../../redux/modules/app';
import { actions as claimActions, getBusinessInfo, getCashbackInfo, getReceiptNumber } from '../../redux/modules/claim';


class PageClaim extends React.Component {
	state = {}

	async componentWillMount() {
		const {
			history,
			claimActions,
		} = this.props;
		const { h = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

		await claimActions.getCashbackReceiptNumber(encodeURIComponent(h));

		const { receiptNumber } = this.props;

		if (receiptNumber) {
			claimActions.getCashbackInfo(receiptNumber);
		}
	}

	renderCashback() {
		const { cashbackInfo } = this.props;
		const {
			cashback,
			defaultLoyaltyRatio,
		} = cashbackInfo || {};
		let percentage = defaultLoyaltyRatio ? Math.floor((1 * 100) / defaultLoyaltyRatio) : 5;
		const cashbackNumber = Number(cashback);

		if (!cashback && !defaultLoyaltyRatio) {
			return null;
		}

		if (!isNaN(cashbackNumber) && cashbackNumber) {
			return <CurrencyNumber className="loyalty__money" money={cashback} />;
		}

		return <span className="loyalty__money">{`${percentage}% Cashback`}</span>;
	}

	renderLocation() {
		const {
			cashbackInfo,
			businessInfo,
		} = this.props;
		const {
			name,
			displayBusinessName,
		} = businessInfo || {};
		const { store } = cashbackInfo || {};
		const { city } = store || {};
		const addressInfo = [displayBusinessName || name, city].filter(v => v);

		return (
			<div className="location">
				<IconPin />
				<span className="location__text text-middle">{addressInfo.join(', ')}</span>
			</div>
		);
	}

	render() {
		const {
			user,
			history,
			onlineStoreInfo,
			businessInfo,
		} = this.props;
		const { isWebview } = user;
		const { logo } = onlineStoreInfo || {};
		const {
			name,
			displayBusinessName,
		} = businessInfo || {};

		if (isWebview) {
			return <div className="loader theme page-loader"></div>;
		}

		return (
			<section className="loyalty__claim" style={{
				// backgroundImage: `url(${theImage})`,
			}}>
				<article className="loyalty__content text-center">
					{
						logo
							? <Image className="logo-default__image-container" src={logo} alt={displayBusinessName || name} />
							: null
					}
					<h5 className="logo-default__title text-uppercase">Earn cashback now</h5>

					{this.renderCashback()}

					{this.renderLocation()}
				</article>
				<div className="asdie-section">
					<PhoneViewContainer history={history} />
				</div>
			</section>
		);
	}
}

export default connect(
	(state) => ({
		user: getUser(state),
		onlineStoreInfo: getOnlineStoreInfo(state),
		businessInfo: getBusinessInfo(state),
		cashbackInfo: getCashbackInfo(state),
		receiptNumber: getReceiptNumber(state),
	}),
	(dispatch) => ({
		claimActions: bindActionCreators(claimActions, dispatch),
	})
)(PageClaim);
