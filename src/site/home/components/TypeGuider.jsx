import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

class TypeGuider extends Component {
  handleHideTypeGuider(e) {
    const { onToggle } = this.props;

    if (e && e.target !== e.currentTarget) {
      return;
    }

    return onToggle();
  }

  handleGotoOrderingPage(url, action) {
    if (action) window.location.href = url;
  }

  renderLoading = () => {
    return (
      <div className="loading-cover">
        <i className="loader theme page-loader"></i>
      </div>
    );
  };

  render() {
    const { t, show, pickupUrl, deliveryUrl, isOutOfDeliveryRange, loading = true } = this.props;
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
            {loading ? this.renderLoading() : null}
            <button
              className="button button__block button__outline margin-smaller text-uppercase text-weight-bold"
              onClick={this.handleGotoOrderingPage.bind(this, pickupUrl, true)}
            >
              {t('SelfPickup')}
            </button>
            <button
              className="button button__block button__fill margin-smaller text-uppercase text-weight-bold"
              disabled={isOutOfDeliveryRange}
              onClick={this.handleGotoOrderingPage.bind(this, deliveryUrl, !isOutOfDeliveryRange)}
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
  onToggle: PropTypes.func,
};

TypeGuider.defaultProps = {
  isOutOfDeliveryRange: false,
  show: false,
  onToggle: () => {},
};

export default withTranslation()(TypeGuider);
