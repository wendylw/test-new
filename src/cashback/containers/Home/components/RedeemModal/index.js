/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import {
	IconRedeemed,
	IconClose
} from '../../../../../components/Icons';
import Header from '../../../../../components/Header';

class RedeemModal extends React.Component {
	render() {
		const { onClose, show } = this.props;

		if (typeof onClose !== 'function') {
			console.error('onClose is required');
			return null;
		}

		if (!show) {
			return null;
		}

		return (
			<div className="full-aside">
				<Header
					className="border__bottom-divider gray has-right"
					title="Redeem info"
					navFunc={onClose}
				/>

				<section className="full-aside__content text-center">
					<figure className="full-aside__image-container">
						<IconRedeemed />
					</figure>
					<h2 className="full-aside__title">How to use your Cashback?</h2>
					<ol className="redeem__list">
						<li className="redeem__item">When paying your bill, tell the cashier your phone number.</li>
						<li className="redeem__item">Your bill will be discounted based on your remaining cashback.</li>
					</ol>
				</section>
			</div>
		);
	}
}

export default RedeemModal;
