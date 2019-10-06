import React from 'react';
import { connect } from 'react-redux';
import { actions as appActions, getBusiness, getMessageInfo } from '../../redux/modules/app';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { IconClose } from '../../../components/Icons'
import { bindActionCreators } from 'redux';

import Modal from '../../../components/Modal';
// import BeepReward from '../../../images/beep-reward.png'
// import RedeemButton from './RedeemButton';
const CLAIMED_ANIMATION_GIF = '/img/succeed-animation.gif';

const MESSAGE_TYPES = {
	PRIMARY: 'primary',
	ERROR: 'error',
};

class Message extends React.Component {
	MESSAGES = {};

	state = {
		error: ['NotClaimed_Cancelled'],
		showAnimation: false,
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
			Claimed_FirstTime: `Awesome, you've earned your first cashback! 🎉 To learn how to redeem it, tap the button below.`,
			Claimed_NotFirstTime: `You've earned more cashback! 🎉`,
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

	renderTopMessage() {
		const { appActions, messageInfo } = this.props;
		const {
			show,
			key,
			message,
		} = messageInfo || {};
		const { error } = this.state;
		const classList = ['top-message', error.includes(key) ? MESSAGE_TYPES.ERROR : MESSAGE_TYPES.PRIMARY];

		if (!show || (!key && !message)) {
			return null;
		}

		return (
			<div className={classList.join(' ')}>
				<i className="top-message__close-button" onClick={() => appActions.hideMessageInfo()}>
					<IconClose />
				</i>
				<span className="top-message__text">
					{key ? (this.MESSAGES[key] || this.MESSAGES.Default) : message}
				</span>
			</div>
		);
	}

	render() {
		const { showAnimation } = this.state;

		// if (!show || (!key && !message)) {
		// 	return null;
		// }

		return (
			<aside className="aside active">
				<div className="aside__section-content border-radius-base">
					<Modal show={true}>
						<div className={`${showAnimation === true ? 'active' : ''}`}>
							<Modal.Header>
								{/* <img src={BeepReward} alt="beep reward" /> */}
							</Modal.Header>
							<Modal.Body>
								<div className="text-center">
									<h4 className="modal__paragraph-container font-weight-bold">test</h4>
									<p className="modal__paragraph">test</p>
									{/* {
										operation == 'close'
											? <button className="modal__paragraph link text-uppercase" onClick={this.closeModal.bind(this)}>{operation}</button>
											: <RedeemButton cashbackFill="button__fill" closeModal={() => this.closeModal()} />
									} */}
								</div>
								<div className="thanks__succeed-animation">
									{/* <img src={CLAIMED_ANIMATION_GIF} alt="Beep Claimed" /> */}
								</div>
							</Modal.Body>
						</div>
					</Modal>
				</div>
			</aside>
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
