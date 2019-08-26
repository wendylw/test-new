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
			enableServiceCharge = 0,
			serviceChargeRate = 0,
		} = businessInfo;

		if (!enableServiceCharge) {
			return null;
		}

		return (
			<li className="billing__item flex flex-middle flex-space-between">
				<label className="gray-font-opacity">Service Charge {typeof serviceChargeRate === 'number' ? `${(serviceChargeRate * 100).toFixed(2)}%` : null}</label>
				<span className="gray-font-opacity">
					<CurrencyNumber money={serviceCharge || 0} />
				</span>
			</li>
		);
	}

	render() {
		const {
			subtotal,
			total,
			tax,
			businessInfo,
		} = this.props;
		const { stores = [] } = businessInfo || {};
		const { receiptTemplateData } = stores[0] || {};

		return (
			<section className="billing">
				<ul className="billing__list">
					<li className="billing__item flex flex-middle flex-space-between">
						<label className="gray-font-opacity">Subtotal</label>
						<span className="gray-font-opacity">
							<CurrencyNumber money={subtotal || 0} />
						</span>
					</li>
					<li className="billing__item flex flex-middle flex-space-between">
						<label className="gray-font-opacity">{(receiptTemplateData || {}).taxName || `Tax`}</label>
						<span className="gray-font-opacity">
							<CurrencyNumber money={tax || 0} />
						</span>
					</li>
					{this.renderServiceCharge()}
					<li className="billing__item flex flex-middle flex-space-between">
						<label className="font-weight-bold">Total</label>
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
	tax: PropTypes.number,
	serviceCharge: PropTypes.number,
	businessInfo: PropTypes.object,
	subtotal: PropTypes.number,
	total: PropTypes.number,
};

Billing.defaultProps = {
	tax: 0,
	serviceCharge: 0,
	businessInfo: {},
	enableServiceCharge: false,
	serviceChargeRate: 0,
	subtotal: 0,
	total: 0,
};

export default Billing;