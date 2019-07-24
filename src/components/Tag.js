import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Tag extends Component {
	render() {
		const {
			text,
			className,
		} = this.props;
		const classList = ['text-uppercase info font-weight-bold'];

		if (className) {
			classList.push(className);
		}

		if (!text) {
			return null;
		}

		return (
			<i className={classList.join(' ')}>
				{text}
			</i>
		);
	}
}

Tag.propTypes = {
	className: PropTypes.string,
	text: PropTypes.string,
};

Tag.defaultProps = {
	text: '',
};

export default Tag;