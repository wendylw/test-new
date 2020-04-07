import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { IconNotificationActive, IconInfoOutline, IconClose } from '../../../components/Icons';
import MediaBoostWhiteImage from '../../../images/media-boost-white.png';
import MvpPromoBannerImage from '../../../images/mvp-promo-banner.jpg';
import './OfferDetails.scss';
import Utils from '../../../utils/utils';

class OfferDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
    };
  }

  handleToggleOfferDetails = () => {
    this.setState({
      show: !this.state.show,
    });
  };

  isCampaignValidTime = () => {
    // example dates for test:
    // const current = new Date('2020-04-07 23:59');
    // const current = new Date('2020-06-01 00:00');
    // /home?fake.date=2020-04-08 00:00
    const fakeDate = Utils.getQueryString('fake.date');
    const current = fakeDate ? new Date(fakeDate) : new Date();
    const validYear = current.getFullYear() === 2020;
    const validMonthDate =
      current.getMonth() >= 3 && current.getDate() >= 8 && current.getMonth() <= 4 && current.getDate() <= 31;

    return validYear && validMonthDate;
  };

  render() {
    const { t } = this.props;
    const { show } = this.state;

    if (!this.isCampaignValidTime()) {
      return null;
    }

    return (
      <React.Fragment>
        <section className="offer-details__bar" onClick={this.handleToggleOfferDetails}>
          <p className="flex flex-middle flex-center">
            <IconNotificationActive className="icon icon__small icon__white" />
            <span className="flex flex-middle text-weight-bold">
              Pay with <img className="offer-details__image-media" src={MediaBoostWhiteImage} alt="Boost logo" /> and
              get 10% cashback
            </span>
          </p>
          <IconInfoOutline className="offer-details__icon-info icon icon__small icon__white" />
        </section>
        {show ? (
          <aside className="offer-details-aside aside-page fixed-wrapper">
            <header className="header flex flex-space-between flex-middle sticky-wrapper">
              <div>
                <IconClose className="icon icon__big icon__gray text-middle" onClick={this.handleToggleOfferDetails} />
                <h2 className="header__title text-middle text-size-big text-weight-bold text-uppercase text-omit__single-line">
                  {t('OfferDetails')}
                </h2>
              </div>
            </header>
            <img className="offer-details-aside__image" src={MvpPromoBannerImage} alt="StoreHub Beep Promo Banner" />
            <article className="offer-details-aside__article padding-normal">
              <h2>StoreHub x Boost Cashback Offer</h2>
              <p>Order food from any store on Beepit.com and earn 10% cashback up to RM5 when you pay via Boost!</p>
              <div className="offer-details-aside__content">
                <h4>Campaign Period</h4>
                <p>8 April 2020 - 31 May 2020</p>
              </div>
              <div className="offer-details-aside__content">
                <h4>Terms & conditions</h4>
                <ol>
                  <li>Applicable to all Boost users</li>
                  <li>10% cashback to be capped at RM5</li>
                  <li>
                    Each eligible customer may only receive maximum of two (2) cashback transactions under this campaign
                  </li>
                  <li>This offer is limited to the first 1,000 transactions</li>
                </ol>
              </div>
            </article>
          </aside>
        ) : null}
      </React.Fragment>
    );
  }
}

export default withTranslation()(OfferDetails);
