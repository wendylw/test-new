import React from 'react';

import PhoneViewContainer from './components/PhoneViewContainer';
import CurrencyNumber from '../../components/CurrencyNumber';
import { IconPin } from '../../../components/Icons';
import Image from '../../../components/Image';
import qs from 'qs';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOnlineStoreInfo } from '../../redux/modules/app';
import { actions as claimActions, getBusinessInfo, getCashbackInfo, getHashData } from '../../redux/modules/claim';


class PageClaim extends React.Component {
	state = {}

	async componentWillMount() {
		const {
			history,
			claimActions,
		} = this.props;
		const { h = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

		await claimActions.getCashbackHashData(encodeURIComponent(h));

		const { hashData } = this.props;
		const { receiptNumber } = hashData || {};

		if (receiptNumber) {
			await claimActions.getCashbackInfo(receiptNumber);
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
			return <CurrencyNumber classList="cash-back__money" money={cashback} />;
		}

		return <span className="cash-back__money">{`${percentage}% Cashback`}</span>;
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
			history,
			onlineStoreInfo,
			businessInfo,
		} = this.props;
		const { logo } = onlineStoreInfo || {};
		const {
			name,
			displayBusinessName,
		} = businessInfo || {};

		return (
			<section className="cash-back flex-column" style={{
				// backgroundImage: `url(${theImage})`,
			}}>
				<article className="cash-back__home text-center">
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
		onlineStoreInfo: getOnlineStoreInfo(state),
		businessInfo: getBusinessInfo(state),
		cashbackInfo: getCashbackInfo(state),
		hashData: getHashData(state),
	}),
	(dispatch) => ({
		claimActions: bindActionCreators(claimActions, dispatch),
	})
)(PageClaim);
