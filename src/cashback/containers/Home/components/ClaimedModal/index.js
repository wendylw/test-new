import React from 'react';
import { connect } from 'react-redux';
import { actions as appActions, getMessageInfo } from '../../redux/modules/app';
import { bindActionCreators } from 'redux';

import RedeemInfo from '../../containers/Home/components/RedeemInfo';
import Modal from '../../../components/Modal';

class ClaimedModal extends React.Component {
	MESSAGES = {};
	timer = null;

	state = {
		animationGifSrc: null,
	}

	componentWillMount() {
		this.initMessages();
	}

	componentDidMount() {
		this.setState({ animationGifSrc: '/img/succeed-animation.gif' });
	}

	initMessages() {
		const messages = {
			Claimed_FirstTime: {
				title: `Awesome, you've earned your first cashback! 🎉 `,
				description: `Tap the button below to learn how to use your cashback.`,
			},
			Claimed_NotFirstTime: {
				title: `You've earned more cashback! 🎉`,
			},
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

	}

	render() {
		const { messageInfo } = this.props;
		const { animationGifSrc } = this.state;
		const { key } = messageInfo || {};
		const isFirstTime = key === 'Claimed_FirstTime';

		if (!show || (!key && !message)) {
			return null;
		}

		return (
			<aside className="aside active">
				<div className="aside__section-content border-radius-base">
					<Modal show={true} className="align-middle">
						<Modal.Body className="active">
							<img src="/img/beep-reward.jpg" alt="beep reward" />
							<div className="modal__detail text-center">
								<h4 className="modal__title font-weight-bold">{this.MESSAGES[key].title}</h4>
								{
									this.MESSAGES[key].description
										? <p className="modal__text">{this.MESSAGES[key].description}</p>
										: null
								}
								{
									isFirstTime
										? <RedeemInfo buttonClassName="button__fill button__block border-radius-base font-weight-bold text-uppercase" buttonText="How to use Cashback?" />
										: null
								}
								<button className="button__block button__block-link link text-uppercase font-weight-bold" onClick={() => appActions.hideMessageInfo()}>Close</button>
								<div className="thanks__succeed-animation">
									<img src={animationGifSrc} alt="Beep Claimed" />
								</div>
							</div>
						</Modal.Body>
					</Modal>
				</div>
			</aside>
		);
	}
}

export default connect(
	(state) => ({
		messageInfo: getMessageInfo(state),
	}),
	(dispatch) => ({
		appActions: bindActionCreators(appActions, dispatch),
	}),
)(ClaimedModal);