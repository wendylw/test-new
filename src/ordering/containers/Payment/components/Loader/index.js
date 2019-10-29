import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Loader extends Component {
	render() {
		const { loaded } = this.props;

		if (loaded) {
			return null;
		}

		return (
			<div className="loading-cover opacity">
				<div className="loader-wave">
					<i className="dot dot1"></i>
					<i className="dot dot2"></i>
					<i className="dot dot3"></i>
					<i className="dot dot4"></i>
				</div>
			</div>
		);
	}
}

Loader.propTypes = {
	loaded: PropTypes.bool,
};

Loader.defaultProps = {
	loaded: false,
};

export default Loader;
