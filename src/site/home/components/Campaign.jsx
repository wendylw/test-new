import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { IconClose } from '../../../components/Icons';
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

  render() {
    const { t } = this.props;
    const { show } = this.state;

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
                <p>23 April 2020 - 8 May 2020</p>
              </div>
              <div className="offer-details-aside__article-content">
                <h4>Terms & conditions</h4>
                <ol>
                  <li>Applicable to all Touch 'n Go eWallet users</li>
                  <li>
                    The RM3 Cashback will be credited back to the eligible Touch 'n Go eWallet user's account within
                    three(3) working days from the transaction date.
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
