import React, { Component } from 'react';

class ErrorToast extends Component {
	componentDidMount() {
		this.timer = setTimeout(() => {
			this.props.clearError();
		}, 3000);
	}

	componentWillUnmount() {
		if (this.timer) {
			clearTimeout(this.timer);
		}
	}

	render() {
		const { message } = this.props;
		return (
			<div className="error-toast">
				<div className="error-toast__text">
					{message}
				</div>
			</div>
		);
	}
}

export default ErrorToast;
