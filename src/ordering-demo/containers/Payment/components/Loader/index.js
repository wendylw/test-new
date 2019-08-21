import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Loader extends Component {
	render() {
		const { loaded } = this.props;

		if (loaded) {
			return null;
		}

		return (
			<div className="loading-cover">
				<div className="loader-wave">
					<i className="dot" id="d1"></i>
					<i className="dot" id="d2"></i>
					<i className="dot" id="d3"></i>
					<i className="dot" id="d4"></i>
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
