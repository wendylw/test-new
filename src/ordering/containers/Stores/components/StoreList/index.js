import React, { Component } from 'react';
import Utils from '../../../../utils/utils';
import Constants from '../../../../utils/constants';

class StoreList extends Component {
	componentDidMount() {
		const { data } = this.props;
		const {
			stores,
			onSelect,
		} = data || {};

		// auto redirect when there only one store in the list
		if (stores && stores.length === 1) {
			onSelect(stores[0].id);
		}
	}

	handleStoreClick = (storeId) => {
		this.props.onSelect(storeId);
	}

	render() {
		const { data } = this.props;
		const { stores } = data || {};

		return (
			<ul className="list">
				{
					(stores || []).map(store => {
						const {
							id,
							name,
						} = store;
						const { ADDRESS_RANGE } = Constants;

						return (
							<li
								key={id}
								className="item border__bottom-divider border-radius-base flex flex-top"
								onClick={() => {
									this.handleStoreClick(id);
								}}
							>
								<div className="item__content flex flex-middle flex-space-between">
									<div className="item__detail">
										<summary className="item__title font-weight-bold">{name}</summary>
										<span className="gray-font-opacity">
											{Utils.getValidAddress(store, ADDRESS_RANGE.CITY)}
										</span>
									</div>
								</div>
							</li>
						);
					})
				}
			</ul>
		);
	}
}

export default StoreList;