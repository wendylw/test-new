import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CurrencyNumber from '../CurrencyNumber';

export class Billing extends Component {
	renderServiceCharge() {
		const {
			serviceCharge,
			businessInfo,
		} = this.props;
		const {
			enableServiceCharge = false,
			serviceChargeRate = 0,
		} = businessInfo;

		// TODO: revert service charge after released BEEP-163
		if (!enableServiceCharge || !serviceCharge) {
			return null;
		}

		return (
			<li className="billing__item flex flex-middle flex-space-between">
				<label>Service Charge {typeof serviceChargeRate === 'number' ? `${(serviceChargeRate * 100).toFixed(2)}%` : null}</label>
				<span>
					{serviceCharge || 0}
				</span>
			</li>
		);
	}

	render() {
		const {
			className,
			subtotal,
			total,
			tax,
			creditsBalance,
			businessInfo,
		} = this.props;
		const { stores = [] } = businessInfo || {};
		const { receiptTemplateData } = stores[0] || {};
		const classList = ['billing'];

		if (className) {
			classList.push(className);
		}

		return (
			<section className={classList.join(' ')}>
				<ul className="billing__list">
					<li className="billing__item flex flex-middle flex-space-between">
						<label>Subtotal</label>
						<span>
							{subtotal || 0}
						</span>
					</li>
					{
						creditsBalance
							? (
								<li className="billing__item show primary border-radius-base flex flex-middle flex-space-between">
									<label className="font-weight-bold">Beep Cashback</label>
									<span>
										- {creditsBalance}
									</span>
								</li>
							)
							: null
					}
					<li className="billing__item flex flex-middle flex-space-between">
						<label>{(receiptTemplateData || {}).taxName || `Tax`}</label>
						<span>
							{tax || 0}
						</span>
					</li>
					{this.renderServiceCharge()}
					<li className="billing__item show flex flex-middle flex-space-between">
						<label>Total</label>
						<span className="font-weight-bold">
							<CurrencyNumber money={total || 0} />
						</span>
					</li>
				</ul>
			</section>
		)
	}
}

Billing.propTypes = {
	className: PropTypes.string,
	tax: PropTypes.number,
	serviceCharge: PropTypes.number,
	businessInfo: PropTypes.object,
	subtotal: PropTypes.number,
	total: PropTypes.number,
	creditsBalance: PropTypes.number,
	enableServiceCharge: PropTypes.bool,
};

Billing.defaultProps = {
	tax: 0,
	serviceCharge: 0,
	businessInfo: {},
	serviceChargeRate: 0,
	subtotal: 0,
	total: 0,
	creditsBalance: 0,
	enableServiceCharge: false,
};

export default Billing;