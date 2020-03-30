import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import { IconMotorcycle } from '../../../components/Icons';
import Image from '../../../components/Image';
import Tag from '../../../components/Tag';

class StoreList extends Component {
  render() {
    const { t, storeList } = this.props;
    const tagClassName = 'tag__card text-size-small text-weight-bold margin-smaller';
    const storeStatus = {
      open: {
        text: t('Open'),
        className: `${tagClassName} text-success`,
      },
      close: {
        text: t('Close'),
        className: `${tagClassName} text-success`,
      },
    };

    return (
      <ul className="store-card-list">
        {storeList.map(store => {
          const { name, shippingFee, minimumConsumption, isOnline, isValidTime, distance } = store || {};
          const currentStoreStatus = storeStatus[isValidTime ? 'open' : 'close'];

          return !isOnline ? null : (
            <li className="store-card-list__item card">
              <Tag text={currentStoreStatus.text} className={currentStoreStatus.className} />
              <Image className="store-card-list__image card__image" src="" alt="" />
              <summary className="padding-small">
                <div className="flex flex-middle flex-space-between">
                  <h3 className="store-card-list__title text-size-bigger text-weight-bold">{name}</h3>
                  <span className="text-opacity">{distance}</span>
                </div>
                <ul className="store-info padding-top-small">
                  <li className="store-info__item text-middle">
                    <IconMotorcycle className="icon icon__smaller text-middle" />
                    <span className="store-info__text text-size-small text-middle">{shippingFee}</span>
                  </li>
                  <li className="store-info__item text-middle">
                    <Trans i18nKey="MinimumOrder" minimumConsumption={minimumConsumption}>
                      <label className="text-size-small text-middle">Min Order.</label>
                      <span className="store-info__text text-size-small text-middle">{minimumConsumption}</span>
                    </Trans>
                  </li>
                </ul>
              </summary>
            </li>
          );
        })}
      </ul>
    );
  }
}

StoreList.propTypes = {
  storeList: PropTypes.array,
};

StoreList.defaultProps = {
  storeList: [],
};

export default withTranslation()(StoreList);
