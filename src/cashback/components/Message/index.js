import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { clearMessage } from '../../../cashback-demo/actions';

class Message extends React.Component {
	timer = null;

	componentDidMount() {
		this.clear();
	}

	componentDidUpdate() {
		this.clear();
	}

	shouldComponentUpdate(nextProps) {
		if ((nextProps.message !== this.props.message)
			|| nextProps.errorMessageKey !== this.props.errorMessageKey) {
			return true;
		}

		return false;
	}

	clear() {
		if (this.timer) {
			clearTimeout(this.timer);
		}

		this.timer = setTimeout(() => {
			// this.props.clearMessage();
			clearTimeout(this.timer);
		}, 5000);
	}

	getMessageType() {
		const { errorMessageKey } = this.props;
		const errorStatus = ['NotClaimed_Cancelled'];
		let messageType = 'primary';

		if (errorStatus.includes(errorMessageKey)) {
			messageType = 'error';
		}

		/* Type includes 'primary', 'error' */
		return messageType;
	}

	getMessage() {
		const { message, errorMessageKey, claimCashbackCountPerDay } = this.props;

		if (!errorMessageKey) {
			return message;
		}

		const messageMap = {
			/* get Cash Back messages */
			Invalid: 'After your purchase, just scan your receipt and enter your mobile number to earn cashback for your next visit. It’s that simple!',
			/* save Cash Back messages */
			Claimed_FirstTime: `Awesome, you've earned your first cashback! 🎉 To learn how to redeem it, tap the button below.`,
			Claimed_NotFirstTime: `You've earned more cashback! 🎉`,
			Claimed_Processing: `You've earned more cashback! We'll add it once it's been processed.😉`,
			Claimed_Someone_Else: `Someone else has already earned cashback for this receipt.😅`,
			Claimed_Repeat: `You've already earned cashback for this receipt.👍`,
			NotClaimed_Expired: `This cashback has expired and cannot be earned anymore.😭`,
			NotClaimed_Cancelled: 'This transaction has been cancelled/refunded.',
			NotClaimed_ReachLimit: `Oops, you've exceeded your cashback limit for today. The limit is ${claimCashbackCountPerDay || 0} time(s) a day. 😭`,
			/* set Otp */
			NotSent_OTP: 'Oops! OTP not sent, please check your phone number and send again.',
			/* verify phone */
			Save_Cashback_Failed: 'Oops! please retry again later.',
			/* Activity */
			Activity_Incorrect: 'Activity incorrect, need retry.'
		};

		let displayMessage = messageMap[errorMessageKey] || `Oops, please scan QR to claim again.`;

		return displayMessage;
	}

	render() {
		const { show = false } = this.props;

		if (!show) {
			return null;
		}

		return (
			<div className={`top-message ${this.getMessageType()}`}>
				<span className="top-message__text">{this.getMessage()}</span>
			</div>
		);
	}
}

export default Message;
