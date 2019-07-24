import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Image from './Image';

export class Item extends Component {
	render() {
		const {
			children,
			className = '',
			image,
			title,
			variation,
			detail,
		} = this.props;

		return (
			<li className={`item border__bottom-divider flex flex-top ${className}`}>
				{
					image
						? <Image className="item__image-container" src={image} />
						: null
				}
				<div className="item__content flex flex-middle flex-space-between">
					<div className="item__detail">
						<summary className="item__title font-weight-bold">{title}</summary>
						{variation ? <p className="item__description">{variation}</p> : null}
						<span className="gray-font-opacity">{detail}</span>
					</div>

					{children}
				</div>
			</li>
		)
	}
}

Item.propTypes = {
	image: PropTypes.string,
	title: PropTypes.string,
	variation: PropTypes.string,
	detail: PropTypes.any,
};

Item.defaultProps = {
	image: '',
	variation: '',
};

export default Item;
