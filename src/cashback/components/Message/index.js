import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getBusiness } from '../../redux/modules/app';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { IconClose } from '../../../components/Icons'

const MESSAGE_TYPES = {
	PRIMARY: 'primary',
	ERROR: 'error',
};

class Message extends React.Component {
	MESSAGES = {};

	state = {
		error: ['NotClaimed_Cancelled'],
	}

	componentWillMount() {
		this.initMessages();
	}

	shouldComponentUpdate(nextProps) {
		return (nextProps.message !== this.props.message) || (nextProps.status !== this.props.status);
	}

	initMessages() {
		const { businessInfo } = this.props;
		const { claimCashbackCountPerDay } = businessInfo || {};
		const messages = {
			Default: 'Oops, please scan QR to claim again.',
			/* get Cash Back messages */
			Invalid: 'After your purchase, just scan your receipt and enter your mobile number to earn cashback for your next visit. It’s that simple!',
			/* save Cash Back messages */
			Claimed_FirstTime: `Awesome, you've earned your first cashback! 🎉 To learn how to redeem it, tap the button below.`,
			Claimed_NotFirstTime: `You've earned more cashback! 🎉`,
			Claimed_Processing: `You've earned more cashback! We'll add it once it's been processed.😉`,
			Claimed_Someone_Else: `Someone else has already earned cashback for this receipt.😅`,
			Claimed_Repeat: `You've already scanned this QR code.😭`,
			NotClaimed_Expired: `This cashback has expired and cannot be earned anymore.😭`,
			NotClaimed_Cancelled: 'This transaction has been cancelled/refunded.',
			NotClaimed_ReachLimit: `Oops, you've exceeded your cashback limit for today. The limit is ${claimCashbackCountPerDay || 0} time(s) a day. 😭`,
			NotClaimed_ReachMerchantLimit: 'Sorry, cashback claims are unavailable at the moment. Please speak to the cashier for more information.',
			/* set Otp */
			NotSent_OTP: 'Oops! OTP not sent, please check your phone number and send again.',
			/* verify phone */
			Save_Cashback_Failed: 'Oops! please retry again later.',
			/* Activity */
			Activity_Incorrect: 'Activity incorrect, need retry.',
		}

		this.MESSAGES = messages;
	}

	getMessage() {
		const { status, message } = this.props;

		if (!status) {
			return message;
		}

		return this.MESSAGES[status] || this.MESSAGES.Default;
	}

	render() {
		const {
			status,
			message,
		} = this.props;
		const { error } = this.state;
		const classList = ['top-message', error.includes(status) ? MESSAGE_TYPES.ERROR : MESSAGE_TYPES.PRIMARY];

		if (!status && !message) {
			return null;
		}

		return (
			<div className={classList.join(' ')}>
				<i className="top-message__close-button" onClick={this.props.clearMessage}>
					<IconClose />
				</i>
				<span className="top-message__text">
					{status ? (this.MESSAGES[status] || this.MESSAGES.Default) : message}
				</span>
			</div>
		);
	}
}

Message.propTypes = {
	status: PropTypes.string,
	message: PropTypes.string,
	clearMessage: PropTypes.func,
};

Message.defaultProps = {
	clearMessage: () => { },
};

export default connect(
	(state) => {
		const business = getBusiness(state) || '';

		return {
			businessInfo: getBusinessByName(state, business),
		}
	}
)(Message);
