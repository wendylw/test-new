import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { IconLocalOffer } from '../../../../../components/Icons';
import { withTranslation } from 'react-i18next';
import Constants from '../../../../../utils/constants';
import PromotionContent from './components/PromotionContent';
import PromotionDetails from './components/PromotionDetails';
import '../PromotionsBar.scss';

const { DELIVERY_METHOD } = Constants;
const SHIPPING_TYPES_MAPPING = {
  [DELIVERY_METHOD.PICKUP]: 5,
  [DELIVERY_METHOD.DELIVERY]: 6,
  [DELIVERY_METHOD.TAKE_AWAY]: 7,
  [DELIVERY_METHOD.DINE_IN]: 8,
};

const PROMOTIONS_MAX_DISPLAY_COUNT = 2;
class PromotionsBar extends PureComponent {
  state = {
    detailsVisible: false,
  };

  checkPromotionVisible = promotion => {
    const { shippingType, inApp } = this.props;
    const { appliedSources, appliedClientTypes } = promotion;

    const source = SHIPPING_TYPES_MAPPING[shippingType || DELIVERY_METHOD.DELIVERY];

    if (!appliedSources.includes(source)) {
      return false;
    }

    if (inApp && !appliedClientTypes.includes('app')) {
      return false;
    }

    return true;
  };

  renderSingle(promotion) {
    const { inApp } = this.props;

    return (
      <div className="flex flex-top padding-small">
        <IconLocalOffer className="icon icon__primary icon__smaller" />
        <p className="margin-left-right-smaller text-line-height-base">
          <PromotionContent inApp={inApp} promotion={promotion} />
        </p>
      </div>
    );
  }

  handleViewDetails = () => {
    this.setState({
      detailsVisible: true,
    });
  };

  handleHideDetails = () => {
    this.setState({
      detailsVisible: false,
    });
  };

  renderMultiple(promotions) {
    const { inApp, t } = this.props;

    return (
      <div className="promotions-bar__multiple padding-smaller">
        <ul className="promotions-bar__list">
          {promotions.slice(0, PROMOTIONS_MAX_DISPLAY_COUNT).map(promo => (
            <li key={promo.id} className="flex flex-middle">
              <IconLocalOffer className="icon icon__primary icon__smaller" />
              <p className="text-line-height-base text-omit__single-line">
                <PromotionContent singleLine={true} inApp={inApp} promotion={promo} />
              </p>
            </li>
          ))}
        </ul>
        <button
          onClick={this.handleViewDetails}
          className="promotions-bar__view-more-button button button__link text-size-small padding-small"
        >
          {t('ViewPromo')}
        </button>

        <PromotionDetails
          onHide={this.handleHideDetails}
          show={this.state.detailsVisible}
          promotions={promotions}
          inApp={inApp}
        />
      </div>
    );
  }

  render() {
    const { promotionRef, promotions } = this.props;

    const visiblePromotions = promotions.filter(this.checkPromotionVisible);

    if (!visiblePromotions.length) {
      return null;
    }

    const isMultiple = visiblePromotions.length > 1;

    return (
      <section ref={promotionRef} className="promotions-bar__container border__top-divider border__bottom-divider">
        {isMultiple ? this.renderMultiple(visiblePromotions) : this.renderSingle(visiblePromotions[0])}
      </section>
    );
  }
}

PromotionsBar.propTypes = {
  promotionRef: PropTypes.oneOfType([
    // Either a function
    PropTypes.func,
    // Or the instance of a DOM native element (see the note about SSR)
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  promotions: PropTypes.array,
  shippingType: PropTypes.oneOf(Object.values(DELIVERY_METHOD)),
  inApp: PropTypes.bool,
};

PromotionsBar.defaultProps = {
  promotions: [],
  inApp: false,
};

export default withTranslation('OrderingHome')(PromotionsBar);
