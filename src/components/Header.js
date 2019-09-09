import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	IconLeftArrow,
	IconClose,
} from './Icons';
import Image from './Image';

class Header extends Component {

	renderLogoAndNavDom() {
		const {
			isStoreHome,
			isPage,
			logo,
			title,
			navFunc,
		} = this.props;

		if (isStoreHome) {
			return (
				<Image
					className="header__image-container text-middle"
					src={logo}
					alt={title}
				/>
			);
		}

		return (
			<figure
				className="header__image-container text-middle"
				onClick={navFunc}
			>
				{isPage ? <IconLeftArrow /> : <IconClose />}
			</figure>
		);
	}

	render() {
		const {
			className,
			isStoreHome,
			title,
			children,
		} = this.props;
		const classList = ['header flex flex-middle flex-space-between'];

		if (className) {
			classList.push(className);
		}

		return (
			<header className={classList.join(' ')}>
				{this.renderLogoAndNavDom()}
				{
					isStoreHome
						? <h1 className="header__title font-weight-bold text-middle">{title}</h1>
						: <h2 className="header__title font-weight-bold text-middle">{title}</h2>
				}
				{children}
			</header>
		)
	}
}

Header.propTypes = {
	className: PropTypes.string,
	isPage: PropTypes.bool,
	isStoreHome: PropTypes.bool,
	logo: PropTypes.string,
	title: PropTypes.string,
	navFunc: PropTypes.func,
};

Header.defaultProps = {
	isPage: false,
	isStoreHome: false,
	title: '',
	navFunc: () => { }
};

export default Header;
