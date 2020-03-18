import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getOnlineStoreInfo } from '../../redux/modules/app';
import { actions as thankYouActionCreators, getBusinessInfo } from '../../redux/modules/thankYou';

export class NeedHelp extends Component {
  render() {
    const { business, t } = this.props;
    const { stores } = business || '';
    const { name, phone, street1 } = stores ? stores[0] : [];
    return (
      <section className="store-list__content">
        <header className="header flex flex-space-between flex-middle gray text-uppercase">{t('NeedHelp')}</header>
        <div className="list_container">
          <ul className="list">
            <li className="item border__bottom-divider">
              <div>
                <summary className="item__title store-info__item font-weight-bold">{t('StoreName')}</summary>
                <span className="gray-font-opacity">{name}</span>
              </div>
            </li>
            <li className="item border__bottom-divider">
              <div>
                <summary className="item__title store-info__item font-weight-bold">{t('ContactInfo')}</summary>
                <span className="gray-font-opacity">{phone}</span>
              </div>
            </li>
            <li className="item border__bottom-divider">
              <div>
                <summary className="item__title store-info__item font-weight-bold">{t('StoreAddress')}</summary>
                <span className="gray-font-opacity">{street1}</span>
              </div>
            </li>
          </ul>
        </div>
      </section>
    );
  }
}

export default compose(
  withTranslation(['OrderingDelivery']),
  connect(
    state => ({
      onlineStoreInfo: getOnlineStoreInfo(state),
      business: getBusinessInfo(state),
    }),
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(NeedHelp);
