import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActions, getBusiness, getMessageInfo } from '../../redux/modules/app';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import TopMessage from '../TopMessage';
import ClaimedMessage from '../ClaimedMessage';

const MESSAGE_TYPES = {
	PRIMARY: 'primary',
	ERROR: 'error',
};

const ERROR_STATUS = ['NotClaimed_Cancelled'];
const EARNED_STATUS = ['Claimed_FirstTime', 'Claimed_NotFirstTime'];

class Message extends React.Component {
	MESSAGES = {};
	animationSetTimeout = null;

	state = {
		modalStatus: [''],
	}

	componentWillMount() {
		this.initMessages();
	}

	initMessages() {
		const { businessInfo } = this.props;
		const { claimCashbackCountPerDay } = businessInfo || {};
		const messages = {
			Default: 'Oops, please scan QR to claim again.',
			/* get Cash Back messages */
			Invalid: 'After your purchase, just scan your receipt and enter your mobile number to earn cashback for your next visit. It’s that simple!',
			/* save Cash Back messages */
			Claimed_FirstTime: {
				title: `Awesome, you've earned your first cashback! 🎉 `,
				description: `Tap the button below to learn how to use your cashback.`,
			},
			Claimed_NotFirstTime: {
				title: `You've earned more cashback! 🎉`,
			},
			Claimed_Processing: `You've earned more cashback! We'll add it once it's been processed.😉`,
			Claimed_Someone_Else: `Someone else has already earned cashback for this receipt.😅`,
			Claimed_Repeat: `You've already earned cashback for this receipt.👍`,
			NotClaimed: 'Looks like something went wrong. Please scan the QR again, or ask the staff for help.',
			NotClaimed_Expired: `This cashback has expired and cannot be earned anymore.😭`,
			NotClaimed_Cancelled: 'This transaction has been cancelled/refunded.',
			NotClaimed_ReachLimit: `Oops, you've exceeded your cashback limit for today. The limit is ${claimCashbackCountPerDay || 0} time(s) a day. 😭`,
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
		const { messageInfo } = this.props;
		const { key, message } = messageInfo || {};

		if (!key) {
			return message;
		}

		return this.MESSAGES[key] || this.MESSAGES.Default;
	}

	render() {
		const { appActions, messageInfo } = this.props;
		const {
			show,
			key,
			message,
		} = messageInfo || {};

		if (!show || (!key && !message)) {
			return null;
		}

		return (
			EARNED_STATUS.includes(key)
				? (
					<ClaimedMessage
						isFirstTime={key === 'Claimed_FirstTime'}
						hideMessage={() => appActions.hideMessageInfo()}
					/>
				)
				: (
					< TopMessage
						className={ERROR_STATUS.includes(key) ? MESSAGE_TYPES.ERROR : MESSAGE_TYPES.PRIMARY}
						hideMessage={() => appActions.hideMessageInfo()}
						message={key ? (this.MESSAGES[key] || this.MESSAGES.Default) : message}
					/>
				)
		);
	}
}

export default connect(
	(state) => {
		const business = getBusiness(state) || '';

		return {
			messageInfo: getMessageInfo(state),
			businessInfo: getBusinessByName(state, business),
		}
	},
	(dispatch) => ({
		appActions: bindActionCreators(appActions, dispatch),
	}),
)(Message);
