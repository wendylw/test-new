import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import {
  IconMotorcycle,
  IconLocation,
  IconEdit,
  IconSearch,
  IconHome,
  IconCropFree,
  IconAccountCircle,
} from '../../components/Icons';
import Image from '../../components/Image';
import Tag from '../../components/Tag';
import '../Common.scss';

class MvpEntry extends Component {
  render() {
    const { t } = this.props;

    return (
      <main className="entry fixed-wrapper">
        {/* Top Banner */}
        <div className="entry-home__banner padding-left-right-normal absolute-wrapper">
          <h2 className="entry-home__banner-title text-size-huge text-weight-bold">
            <Trans i18nKey="DiscoverDescription">
              Discover new
              <br />
              restaurants around you
            </Trans>
          </h2>
        </div>
        {/* End of Top Banner */}

        {/* Deliver To Entry */}
        <div className="deliver-to-entry flex flex-middle flex-space-between base-box-shadow absolute-wrapper">
          <div className="deliver-to-entry__content">
            <label className="deliver-to-entry__label text-uppercase text-weight-bold">{t('DeliverTo')}</label>
            <div>
              <IconLocation className="icon icon__small icon__gray text-middle" />
              <span className="deliver-to-entry__address text-opacity text-middle">
                10 Boulevard Damansara PJU 6A, 47400 Petaling
              </span>
            </div>
          </div>
          <IconEdit className="icon icon__small icon__privacy text-middle" />
        </div>
        {/* End of  Deliver To Entry */}

        <section className="entry-home wrapper">
          <div className="padding-normal">
            <div className="form__group flex flex-middle">
              <IconSearch className="icon icon__normal icon__gray" />
              <input className="form__input" type="text" placeholder={t('SearchRestaurantPlaceholder')} />
            </div>
          </div>

          {/* Store Cards */}
          <div className="store-card-list__container padding-normal">
            <h2 className="text-size-biggest text-weight-bold">{t('NearbyRestaurants')}</h2>
            <ul className="store-card-list">
              <li className="store-card-list__item card">
                <Tag text={t('Open')} className="store-card-list__item-open tag__card text-weight-bold" />
                <Image className="store-card-list__image card__image" src="" alt="" />
                <summary className="padding-small">
                  <div className="flex flex-middle flex-space-between">
                    <h3 className="store-card-list__title text-size-bigger text-weight-bold">Dai Ga Jay</h3>
                    <span className="text-opacity">0.05 km</span>
                  </div>
                  <ul className="store-info padding-top-small">
                    <li className="store-info__item text-middle">
                      <IconMotorcycle className="icon icon__smaller text-middle" />
                      <span className="store-info__text text-size-small text-middle">RM 5.00</span>
                    </li>
                    <li className="store-info__item text-middle">
                      <Trans i18nKey="MinimumOrder" minOrder="RM 5.00">
                        <label className="text-size-small text-middle">Min Order.</label>
                        <span className="store-info__text text-size-small text-middle">RM 5.00</span>
                      </Trans>
                    </li>
                  </ul>
                </summary>
              </li>
              <li className="store-card-list__item card">
                <Image className="store-card-list__image card__image" src="" alt="" />
                <summary className="padding-small">
                  <div className="flex flex-middle flex-space-between">
                    <h3 className="store-card-list__title text-size-bigger text-weight-bold">Dai Ga Jay</h3>
                    <span className="text-opacity">0.05 km</span>
                  </div>
                  <ul className="store-info padding-top-small">
                    <li className="store-info__item text-middle">
                      <IconMotorcycle className="icon icon__smaller text-middle" />
                      <span className="store-info__text text-size-small text-middle">RM 5.00</span>
                    </li>
                    <li className="store-info__item text-middle">
                      <Trans i18nKey="MinimumOrder" minOrder="RM 5.00">
                        <label className="text-size-small text-middle">Min Order.</label>
                        <span className="store-info__text text-size-small text-middle">RM 5.00</span>
                      </Trans>
                    </li>
                  </ul>
                </summary>
              </li>
              <li className="store-card-list__item card">
                <Image className="store-card-list__image card__image" src="" alt="" />
                <summary className="padding-small">
                  <div className="flex flex-middle flex-space-between">
                    <h3 className="store-card-list__title text-size-bigger text-weight-bold">Dai Ga Jay</h3>
                    <span className="text-opacity">0.05 km</span>
                  </div>
                  <ul className="store-info padding-top-small">
                    <li className="store-info__item text-middle">
                      <IconMotorcycle className="icon icon__smaller text-middle" />
                      <span className="store-info__text text-size-small text-middle">RM 5.00</span>
                    </li>
                    <li className="store-info__item text-middle">
                      <Trans i18nKey="MinimumOrder" minOrder="RM 5.00">
                        <label className="text-size-small text-middle">Min Order.</label>
                        <span className="store-info__text text-size-small text-middle">RM 5.00</span>
                      </Trans>
                    </li>
                  </ul>
                </summary>
              </li>
            </ul>
          </div>
          {/* end of Store Cards */}
        </section>

        <footer className="entry__bar">
          <ul className="flex flex-middle flex-space-around">
            <li className="entry__item icon__item active">
              <IconHome className="icon icon__gray" />
            </li>
            <li className="entry__item icon__item">
              <IconCropFree className="icon icon__gray" />
            </li>
            <li className="entry__item icon__item">
              <IconAccountCircle className="icon icon__gray" />
            </li>
          </ul>
        </footer>
      </main>
    );
  }
}

export default withTranslation()(MvpEntry);
