import React from 'react';

import RedeemModal from './RedeemModal';
import LoyaltyView from './RecentActivities';
import Image from '../../../components/Image';
import Message from '../../components/Message';
import CurrencyNumber from '../../components/CurrencyNumber';

import qs from 'qs';

// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
// import { setCustomerId } from '../actions';

class PageLoyalty extends React.Component {
	state = {
		showModal: false,
	}

	componentWillMount() {
		const {
			history,
			setCustomerId,
		} = this.props;
		const { customerId = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

		// setCustomerId({ customerId });
	}

	render() {
		const {
			business,
			onlineStoreInfo,
			cashbackHistory,
		} = this.props;
		const { totalCredits } = cashbackHistory || {};
		const { logo } = onlineStoreInfo || {};
		const { displayBusinessName, name } = business || {};

		return (
			<section className="loyalty__home flex-column">
				<Message />
				<section className="loyalty__content text-center">
					{
						logo ? (
							<Image className="logo-default__image-container" src={logo} alt={displayBusinessName || name} />
						) : null
					}
					<h5 className="logo-default__title text-uppercase">Total cashback</h5>
					<CurrencyNumber className="loyalty__money" money={totalCredits || 0} />
					<div className="redeem__button-container">
						<button className="redeem__button button__outline button__block border-radius-base font-weight-bold text-uppercase" onClick={() => this.setState({ showModal: true })}>How to redeem?</button>
						<RedeemModal
							show={this.state.showModal}
							onClose={() => this.setState({ showModal: false })}
						/>
					</div>
				</section>
				<LoyaltyView />
			</section>
		);
	}
}

export default PageLoyalty;

// const mapStateToProps = state => ({
// 	business: state.common.business,
// 	cashbackHistory: state.user.cashbackHistory,
// });

// const mapDispatchToProps = dispatch => bindActionCreators({
// 	setCustomerId,
// }, dispatch);

// export default connect(mapStateToProps, mapDispatchToProps)(PageLoyalty);
