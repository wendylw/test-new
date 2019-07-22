/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import { compose, Query } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import withShoppingCart from '../libs/withShoppingCart';
import { shoppingCartType } from '../views/propTypes';
import CartItems from '../views/components/CartItems';
import CurrencyNumber from '../views/components/CurrencyNumber';
import { clientCoreApi } from '../apiClient';
import apiGql from '../apiGql';
import config from '../config';
import Constants from '../Constants';

export class ReceiptDetail extends Component {
	static propTypes = {
		shoppingCart: shoppingCartType,
	}

	backToHome() {
		const { history } = this.props;
		history.replace(Constants.ROUTER_PATHS.HOME, history.location.state);
	}

	render() {
		const { shoppingCart = {} } = this.props;

		const {
			subtotal,
			total,
			tax,
			serviceCharge,  // TODO: Needs API
		} = shoppingCart;

		return (
			<section className="table-ordering__order">
				<header className="header border__bottom-divider flex flex-middle flex-space-between">
					<figure className="header__image-container text-middle" onClick={this.backToHome.bind(this)}>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
					</figure>
					<h2 className="header__title font-weight-bold text-middle">View Receipt</h2>
					<span className="gray-font-opacity text-uppercase">
						{/* {
							order.tableId
								? `Table ${order.tableId}`
								: 'Self pick-up'
						} */}
					</span>
				</header>
				<div className="list__container">
					<CartItems />
				</div>
				<section className="billing">
					<ul className="billing__list">
						<li className="billing__item flex flex-middle flex-space-between">
							<label className="gray-font-opacity">Subtotal</label>
							<span className="gray-font-opacity"><CurrencyNumber money={subtotal || 0} /></span>
						</li>
						<Query
							query={apiGql.GET_CORE_BUSINESS}
							client={clientCoreApi}
							variables={{ business: config.business, storeId: config.storeId }}
							onError={err => console.error('Can not get business.stores from core-api\n', err)}
						>
							{({ data: { business = {} } = {} }) => {
								if (!Array.isArray(business.stores) || !business.stores.length) {
									return null;
								}

								const { stores, enableServiceCharge, serviceChargeRate/*, serviceChargeTax*/ } = business;

								return (
									<React.Fragment>
										<li className="billing__item flex flex-middle flex-space-between">
											<label className="gray-font-opacity">{(stores[0].receiptTemplateData || {}).taxName || `Tax`}</label>
											<span className="gray-font-opacity"><CurrencyNumber money={tax || 0} /></span>
										</li>
										{(/* TODO: open this false */ false && enableServiceCharge) ? <li className="billing__item flex flex-middle flex-space-between">
											<label className="gray-font-opacity">Service Charge {typeof serviceChargeRate === 'number' ? `${(serviceChargeRate * 100).toFixed(2)}%` : null}</label>
											<span className="gray-font-opacity">{serviceCharge}</span>
										</li> : null}
									</React.Fragment>
								);
							}}
						</Query>
						<li className="billing__item flex flex-middle flex-space-between">
							<label className="font-weight-bold">Total</label>
							<span className="font-weight-bold"><CurrencyNumber money={total || 0} /></span>
						</li>
					</ul>
				</section>
			</section>
		)
	}
}

export default compose(withRouter, withShoppingCart({
	props: ({ gqlShoppingCart: { loading, shoppingCart } }) => {
		if (loading) {
			return null;
		}

		return { shoppingCart };
	},
}))(ReceiptDetail);