import React from 'react';
import PropTypes from 'prop-types';

class Error extends React.Component {
	render() {
		const {
			title = 'Eep!',
			message = 'Looks like something went wrong. Please scan the QR again, or ask the staff for help.',
		} = this.props.location.state || {};

		return (
			<section className="table-ordering__prompt-page">
				<figure className="prompt-page__image-container text-center">
					<img src="/img/beep-error.png" alt="error found" />
				</figure>
				<div className="prompt-page__content">
					<h2 className="prompt-page__title text-center">{title}</h2>
					<div className="prompt-page__paragraphs">
						<p>{message}</p>
					</div>
				</div>
			</section>
		);
	}
}

Error.propTypes = {
	title: PropTypes.string,
	message: PropTypes.string,
};

Error.defaultProps = {
	message: '',
};

export default Error;
