/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import Item from '../../components/Item';
import Billing from '../../components/Billing';
import ItemOperator from '../../components/ItemOperator';
import CurrencyNumber from '../../components/CurrencyNumber';
import Constants from '../../../utils/constants';
import config from '../../../config';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as thankYouActions, getOrder, getBusinessInfo } from '../../redux/modules/thankYou';

export class ReceiptDetail extends Component {
	backToThankYou() {
		const { history, order } = this.props;
		const h = config.h();
		const { orderId } = order || {};

		history.replace(`${Constants.ROUTER_PATHS.THANK_YOU}?h=${h}&receiptNumber=${orderId}`, history.location.state);
	}

	renderProductItem() {
		const { order } = this.props;
		const { items } = order || {};

		return (
			<div className="list__container">
				{
					(items || []).map(item => {
						const {
							id,
							title,
							variationTexts,
							unitPrice,
							quantity,
							image,
						} = item;

						if (item.itemType) {
							return null;
						}

						return (
							<Item
								contentClassName="flex-top"
								key={id}
								image={image}
								title={title}
								variation={variationTexts.join(', ')}
								detail={
									<CurrencyNumber money={unitPrice || 0} />
								}
							>

								<ItemOperator
									className="flex-middle exhibit"
									quantity={quantity}
									decreaseDisabled={quantity === 0}
								/>
							</Item>
						);
					})
				}
			</div>
		);
	}

	render() {
		const { order } = this.props;
		const {
			orderId,
			tax,
			serviceCharge,
			subtotal,
			total,
			tableId,
		} = order || {};

		return (
			<section className="table-ordering__receipt">
				<header className="header border__bottom-divider flex flex-middle flex-space-between">
					<figure className="header__image-container text-middle" onClick={this.backToThankYou.bind(this)}>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /><path d="M0 0h24v24H0z" fill="none" /></svg>
					</figure>
					<h2 className="header__title font-weight-bold text-middle">View Receipt</h2>
					<span className="gray-font-opacity text-uppercase">
						{
							tableId
								? `Table ${tableId}`
								: 'Self pick-up'
						}
					</span>
				</header>
				<div className="receipt__content text-center">
					<label className="receipt__label gray-font-opacity font-weight-bold text-uppercase">Receipt Number</label>
					<span className="receipt__id-number">{orderId}</span>
				</div>
				{this.renderProductItem()}
				<Billing
					tax={tax}
					serviceCharge={serviceCharge}
					subtotal={subtotal}
					total={total}
				/>
			</section>
		)
	}
}

export default connect(
	(state) => ({
		businessInfo: getBusinessInfo(state),
		order: getOrder(state),
	}),
	(dispatch) => ({
		thankYouActions: bindActionCreators(thankYouActions, dispatch),
	})
)(ReceiptDetail);