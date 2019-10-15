/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../../components/Header';

class RedeemInfo extends React.Component {
	state = {
		showModal: false,
	}

	toggleModal() {
		const { showModal } = this.state;

		this.setState({ showModal: !showModal })
	}

	render() {
		const {
			className,
			buttonClassName,
			buttonText,
		} = this.props;
		const { showModal } = this.state;

		return (
			<div className={className}>
				<button className={buttonClassName} onClick={this.toggleModal.bind(this)}>{buttonText}</button>
				{
					showModal
						? (
							<div className="full-aside">
								<Header
									isPage={true}
									navFunc={this.toggleModal.bind(this)}
								/>

								<section className="full-aside__content text-center">
									<figure className="full-aside__image-container">
										<img src="/img/beep-qrscan.png" alt="otp" />
									</figure>
									<h2 className="full-aside__title">How to use Cashback?</h2>
									<ol className="redeem__list">
										<li className="redeem__item">When paying your bill, tell the cashier your phone number.</li>
										<li className="redeem__item">Your bill will be discounted based on your remaining cashback.</li>
									</ol>
								</section>
							</div>
						)
						: null
				}
			</div>
		);
	}
}

RedeemInfo.propTypes = {
	buttonClassName: PropTypes.string,
	buttonText: PropTypes.string,
};

RedeemInfo.defaultProps = {
	buttonClassName: '',
	buttonText: '',
};

export default RedeemInfo;
