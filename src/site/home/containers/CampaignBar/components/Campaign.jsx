import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { IconClose } from '../../../../../components/Icons';
import './Campaign.scss';

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
    const { t, campaign } = this.props;
    const { show } = this.state;

    if (!campaign) {
      return null;
    }

    return (
      <React.Fragment>
        <section
          className="offer-details__bar"
          data-heap-name="site.home.campaign-bar"
          onClick={this.handleToggleOfferDetails}
        >
          <p className="flex flex-middle flex-center">
            <img className="offer-details__bar-image" src={campaign.barImage} alt="" />
          </p>
          {/* <IconInfoOutline className="offer-details__icon-info icon icon__small icon__white" /> */}
        </section>
        <aside className={`offer-details-aside aside fixed-wrapper${show ? ' active' : ''}`}>
          <div className="offer-details-aside__content aside__content">
            <header className="header flex flex-space-between flex-middle sticky-wrapper">
              <div>
                <IconClose
                  className="icon icon__big icon__default text-middle"
                  data-heap-name="site.campaign.close-btn"
                  onClick={this.handleToggleOfferDetails}
                />
                <h2 className="header__title text-middle text-size-big text-weight-bolder text-omit__single-line">
                  {t('OfferDetails')}
                </h2>
              </div>
            </header>
            <img className="offer-details-aside__image" src={campaign.bannerImage} alt="StoreHub Beep Promo Banner" />
            <article className="offer-details-aside__article padding-normal">
              <h2>{campaign.subject}</h2>
              <p>{campaign.description}</p>
              {campaign.sections.map((section, sectionIndex) => {
                if (section.type === 'campaign_period') {
                  return (
                    <div key={sectionIndex} className="offer-details-aside__article-content">
                      <h4>{section.subject}</h4>
                      <p>{section.fields.activeDateRange}</p>
                    </div>
                  );
                } else if (section.type === 'terms_and_conditions') {
                  return (
                    <div key={sectionIndex} className="offer-details-aside__article-content">
                      <h4>{section.subject}</h4>
                      <ol>
                        {section.fields.conditions.map((condition, conditionIndex) => {
                          return <li key={conditionIndex}>{condition}</li>;
                        })}
                      </ol>
                    </div>
                  );
                } else {
                  return null;
                }
              })}
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
