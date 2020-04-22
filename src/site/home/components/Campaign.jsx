import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { IconClose } from '../../../components/Icons';
import Utils from '../../../utils/utils';
import banner from './images/Banner.jpg';
import promoBanner from './images/PromoBanner.jpg';
import './OfferDetails.scss';

class Campaign extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
    };
  }

  handleToggleOfferDetails = () => {
    this.props.onToggle();
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
      current.getMonth() >= 3 && current.getDate() >= 21 && current.getMonth() <= 4 && current.getDate() <= 30;
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
            <img className="offer-details__bar-image" src={banner} alt="" />
          </p>
          {/* <IconInfoOutline className="offer-details__icon-info icon icon__small icon__white" /> */}
        </section>
        <aside className={`offer-details-aside aside fixed-wrapper${show ? ' active' : ''}`}>
          <div className="offer-details-aside__content aside__content">
            <header className="header flex flex-space-between flex-middle sticky-wrapper">
              <div>
                <IconClose className="icon icon__big icon__gray text-middle" onClick={this.handleToggleOfferDetails} />
                <h2 className="header__title text-middle text-size-big text-weight-bolder text-omit__single-line">
                  {t('OfferDetails')}
                </h2>
              </div>
            </header>
            <img className="offer-details-aside__image" src={promoBanner} alt="StoreHub Beep Promo Banner" />
            <article className="offer-details-aside__article padding-normal">
              <h2>StoreHub x Touch 'n Go eWallet Cashback Offer</h2>
              <p>Order food from any store on Beepit.com and earn RM3 Cashback when you pay via Touch 'n Go eWallet!</p>
              <div className="offer-details-aside__article-content">
                <h4>Campaign Period</h4>
                <p>21st April 2020 - 30th April 2020</p>
              </div>
              <div className="offer-details-aside__article-content">
                <h4>Terms & conditions</h4>
                <ol>
                  <li>Applicable to all Touch 'n Go eWallet users</li>
                  <li>
                    Earn RM3 cashback credited to your eWallet when you spend at least RM20 on beepit.com or on
                    businesses on the Beep Delivery platform.
                  </li>
                  <li>Each user is only entitled to receive the RM3 Cashback once throughout the Promotion Period.</li>
                  <li>
                    This offer is limited to the first 3,000 transactions. The Promotion will end once there has been
                    3,000 Transactions carried out or on expiry of the Promotion Period, whichever is earlier.
                  </li>
                </ol>
              </div>
            </article>
          </div>
        </aside>
        {/* {show ? (
        ) : null} */}
      </React.Fragment>
    );
  }
}

Campaign.propTypes = {
  onToggle: PropTypes.func,
};

Campaign.defaultProps = {
  onToggle: () => {},
};

export default withTranslation()(Campaign);
