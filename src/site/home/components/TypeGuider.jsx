import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

class TypeGuider extends Component {
  handleHideTypeGuider(e) {
    const { onToggle } = this.props;

    if (e && e.target !== e.currentTarget) {
      return;
    }

    onToggle();
  }

  handleGotoOrderingPage(url) {
    window.location.href = url;
  }

  render() {
    const { t, show, pickupUrl, deliveryUrl, isOutOfDeliveryRange } = this.props;
    const contentText = {
      withinDeliveryRange: {
        title: t('SelectYourPreference'),
        description: t('WithinDeliveryRangeDescription'),
      },
      OutOfDeliveryRange: {
        title: t('OutOfDeliveryRange'),
        description: t('OutOfDeliveryRangeDescription'),
      },
    };
    const currentText = contentText[isOutOfDeliveryRange ? 'OutOfDeliveryRange' : 'withinDeliveryRange'];
    const classList = ['type-guider-aside aside fixed-wrapper'];

    if (show) {
      classList.push('active');
    }

    return (
      <aside className={classList.join(' ')} onClick={e => this.handleHideTypeGuider(e)}>
        <div className="type-guider-aside__content aside__content absolute-wrapper text-center">
          <h2 className="padding-small text-size-biggest text-weight-bold">{currentText.title}</h2>
          <p className="type-guider-aside__description padding-normal text-opacity">{currentText.description}</p>
          <div className="padding-normal type-guider-aside__button-group flex flex-middle flex-space-between">
            <button
              className="button button__block button__outline margin-smaller text-uppercase text-weight-bold"
              onClick={this.handleGotoOrderingPage.bind(this, pickupUrl)}
            >
              {t('SelfPickup')}
            </button>
            <button
              className="button button__block button__fill margin-smaller text-uppercase text-weight-bold"
              disabled={isOutOfDeliveryRange}
              onClick={isOutOfDeliveryRange ? this.handleGotoOrderingPage.bind(this, deliveryUrl) : () => {}}
            >
              {t('FoodDelivery')}
            </button>
          </div>
        </div>
      </aside>
    );
  }
}

TypeGuider.propTypes = {
  deliveryUrl: PropTypes.string,
  pickupUrl: PropTypes.string,
  isOutOfDeliveryRange: PropTypes.bool.isRequired,
  show: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

TypeGuider.defaultProps = {
  isOutOfDeliveryRange: false,
  show: false,
  onToggle: () => {},
};

export default withTranslation()(TypeGuider);
