/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import { compose } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import withOrderDetail from '../libs/withOrderDetail';
import withShoppingCart from '../libs/withShoppingCart';
import withOnlinstStoreInfo from '../libs/withOnlineStoreInfo';
import { shoppingCartType } from '../views/propTypes';

import Billing from '../views/components/Billing';
import CartItems from '../views/components/CartItems';

import config from '../config';
import Constants from '../Constants';

export class ReceiptDetail extends Component {
	backToThankYou() {
		const { history } = this.props;
		const h = config.h();
		const query = new URLSearchParams(history.location.search);
		const receiptNumber = query.get('receiptNumber');

		history.replace(`${Constants.ROUTER_PATHS.THANK_YOU}?h=${h}&receiptNumber=${receiptNumber}`, history.location.state);
	}

	render() {
		const {
			order = {},
			onlineStoreInfo,
			shoppingCart = {}
		} = this.props;

		return (
			<section className="table-ordering__receipt">
				<header className="header border__bottom-divider flex flex-middle flex-space-between">
					<figure className="header__image-container text-middle" onClick={this.backToThankYou.bind(this)}>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
					</figure>
					<h2 className="header__title font-weight-bold text-middle">View Receipt</h2>
					<span className="gray-font-opacity text-uppercase">
						{
							order.tableId
								? `Table ${order.tableId}`
								: 'Self pick-up'
						}
					</span>
				</header>
				<div className="receipt__content text-center">
					<label className="receipt__label gray-font-opacity font-weight-bold text-uppercase">Receipt Number</label>
					<span className="receipt__id-number">{order.orderId}</span>
				</div>
				<div className="list__container">
					<CartItems exhibit={true} />
				</div>
				<Billing
					shoppingCart={shoppingCart}
					onlineStoreInfo={onlineStoreInfo}
				/>
			</section>
		)
	}
}

ReceiptDetail.propTypes = {
	shoppingCart: shoppingCartType,
};

export default compose(withRouter,
	withOnlinstStoreInfo({
		props: ({ gqlOnlineStoreInfo: { loading, onlineStoreInfo } }) => {
			if (loading) {
				return null;
			}
			return { onlineStoreInfo };
		},
	}),
	withShoppingCart({
		props: ({ gqlShoppingCart: { loading, shoppingCart } }) => {
			if (loading) {
				return null;
			}

			return { shoppingCart };
		},
	}),
	withOrderDetail({
		options: ({ history }) => {
			const query = new URLSearchParams(history.location.search);
			const orderId = query.get('receiptNumber');

			return ({
				variables: {
					business: config.business,
					orderId,
				}
			});
		},
		props: ({ gqlOrderDetail: { loading, order } }) => {
			if (loading) {
				return null;
			}

			return { order };
		}
	}),
)(ReceiptDetail);