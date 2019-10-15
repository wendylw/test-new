import React from 'react';
import { IconClose } from '../../../components/Icons'

class TopMessage extends React.Component {
	state = {}

	render() {
		const {
			className,
			children,
			hideMessage,
		} = this.props;
		const classList = ['top-message'];

		if (className) {
			classList.push(className);
		}

		return (
			<div className={classList.join(' ')}>
				<i className="top-message__close-button" onClick={() => hideMessage()}>
					<IconClose />
				</i>
				{/* <span className="top-message__text">
				</span> */}
				{children}
			</div>
		);
	}
}

TopMessage.propTypes = {
	className: PropTypes.string,
	hideMessage: PropTypes.func,
};

TopMessage.defaultTypes = {
	message: '',
	hideMessage: () => { },
};

export default TopMessage;
