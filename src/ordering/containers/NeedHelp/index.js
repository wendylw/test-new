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
      <section className="need-help">
        <Header className="has-right" isPage={false} title={t('NeedHelp')} navFunc={() => history.goBack()} />
        <div className="need-help__info-container">
          <ul className="list">
            <li className="item border__bottom-divider">
              <summary className="item__title store-info__item font-weight-bold">{t('StoreName')}</summary>
              <span className="item__text gray-font-opacity">{name}Uppercuppa</span>
            </li>
            <li className="item border__bottom-divider">
              <summary className="item__title store-info__item font-weight-bold">{t('ContactInfo')}</summary>
              <a className="item__text link link__non-underline link__block" href={`tel:${phone}`}>
                {phone}+60 012 98765432
              </a>
            </li>
            <li className="item">
              <summary className="item__title store-info__item font-weight-bold">{t('StoreAddress')}</summary>
              <span className="item__text gray-font-opacity">
                {street1}34, Jalan Ambong 4, Kepong Baru, 52100 Kuala Lumpur
              </span>
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
