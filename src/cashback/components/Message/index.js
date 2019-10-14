import React from 'react';
import { connect } from 'react-redux';
import { actions as appActions, getBusiness, getMessageInfo } from '../../redux/modules/app';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { IconClose } from '../../../components/Icons'
import { bindActionCreators } from 'redux';

import Modal from '../../../components/Modal';
import RedeemInfo from '../../containers/Home/components/RedeemInfo';

const MESSAGE_TYPES = {
	PRIMARY: 'primary',
	ERROR: 'error',
};

const ERROR_STATUS = ['NotClaimed_Cancelled'];
const EARNED_STATUS = ['Claimed_FirstTime', 'Claimed_NotFirstTime'];

const ANIMATION_TIME = 3600;

class Message extends React.Component {
	MESSAGES = {};
	animationSetTimeout = null;

	state = {
		modalStatus: [''],
		animationGifSrc: null,
	}

	componentWillMount() {
		this.initMessages();
	}

	componentDidMount() {
		this.setState({ animationGifSrc: '/img/succeed-animation.gif' });

		this.animationSetTimeout = setTimeout(() => {
			this.setState({ animationGifSrc: null });

			clearTimeout(this.animationSetTimeout);
		}, ANIMATION_TIME);
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

	renderModalMessage() {
		const { messageInfo, appActions } = this.props;
		const { animationGifSrc } = this.state;
		const { key } = messageInfo || {};
		const isFirstTime = key === 'Claimed_FirstTime';

		return (
			<aside className="aside active">
				<div className="aside__section-content border-radius-base">
					<Modal show={true} className="align-middle">
						<Modal.Body className="active">
							<img src="/img/beep-reward.jpg" alt="beep reward" />
							<div className="modal__detail text-center">
								<h4 className="modal__title font-weight-bold">{this.MESSAGES[key].title}</h4>
								{
									this.MESSAGES['Claimed_FirstTime'].description
										? <p className="modal__text">{this.MESSAGES[key].description}</p>
										: null
								}
								{
									isFirstTime
										? <RedeemInfo buttonClassName="button__fill button__block border-radius-base font-weight-bold text-uppercase" buttonText="How to use Cashback?" />
										: null
								}

								<button className="button__block button__block-link link text-uppercase font-weight-bold" onClick={() => appActions.hideMessageInfo()}>Close</button>

								<div className={`succeed-animation ${animationGifSrc ? 'active' : ''}`}>
									<img src={animationGifSrc} alt="Beep Claimed" />
								</div>
							</div>
						</Modal.Body>
					</Modal>
				</div>
			</aside>
		);
	}

	render() {
		const { appActions, messageInfo } = this.props;
		const {
			show,
			key,
			message,
		} = messageInfo || {};
		const classList = ['top-message', ERROR_STATUS.includes(key) ? MESSAGE_TYPES.ERROR : MESSAGE_TYPES.PRIMARY];

		if (!show || (!key && !message)) {
			return null;
		}

		if (EARNED_STATUS.includes(key)) {
			return this.renderModalMessage();
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
