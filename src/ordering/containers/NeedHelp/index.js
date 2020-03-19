import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import Constants from '../../../utils/constants';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as thankYouActionCreators, getBusinessInfo } from '../../redux/modules/thankYou';

export class NeedHelp extends Component {
  render() {
    const { history, businessInfo, t } = this.props;
    const { stores } = businessInfo || '';
    const { name, phone, street1 } = stores ? stores[0] : [];

    return (
      <section className="store-list__content">
        <Header className="has-right" isPage={false} title={t('NeedHelp')} navFunc={() => history.goBack()} />
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
      businessInfo: getBusinessInfo(state),
    }),
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(NeedHelp);
