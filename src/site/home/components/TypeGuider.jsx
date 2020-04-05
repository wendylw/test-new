import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import config from '../../../config';
import RedirectForm from '../../../ordering/containers/Payment/components/RedirectForm';

class TypeGuider extends Component {
  state = {
    url: '',
  };

  handleHideTypeGuider(e) {
    const { onToggle } = this.props;

    if (e && e.target !== e.currentTarget) {
      return;
    }

    return onToggle();
  }

  handleGotoOrderingPage(url, action) {
    if (action) this.setState({ url });
  }

  renderLoading = () => {
    return (
      <div className="type-guider-aside__loader-container flex flex-middle margin-normal">
        <i className="type-guider-aside__loader loader theme text-size-biggest"></i>
      </div>
    );
  };

  renderRedirect = () => {
    const { business, deliveryAddress } = this.props;
    const { url } = this.state;

    // todo: extract as <StoreSiteRedirectForm />
    return (
      <RedirectForm
        method={'post'}
        action={config.beepOnlineStoreUrl(business) + '/go2page'}
        data={{
          target: url,
          deliveryAddress: JSON.stringify(deliveryAddress),
        }}
      />
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

    if (this.state.url) {
      return this.renderRedirect();
    }

    return (
      <aside className={classList.join(' ')} onClick={e => this.handleHideTypeGuider(e)}>
        <div className="type-guider-aside__content aside__content absolute-wrapper text-center">
          <h2 className="padding-small text-size-biggest text-weight-bold">{currentText.title}</h2>
          <p className="type-guider-aside__description padding-normal text-opacity">{currentText.description}</p>
          {loading ? (
            this.renderLoading()
          ) : (
            <div className="type-guider-aside__button-group padding-normal flex flex-middle flex-space-between">
              <button
                className="button button__block button__outline margin-normal text-uppercase text-weight-bold"
                onClick={this.handleGotoOrderingPage.bind(this, pickupUrl, true)}
              >
                {t('SelfPickup')}
              </button>
              <button
                className="button button__block button__fill margin-normal text-uppercase text-weight-bold"
                disabled={isOutOfDeliveryRange}
                onClick={this.handleGotoOrderingPage.bind(this, deliveryUrl, !isOutOfDeliveryRange)}
              >
                {t('FoodDelivery')}
              </button>
            </div>
          )}
        </div>
      </aside>
    );
  }
}

TypeGuider.propTypes = {
  business: PropTypes.string.isRequired,
  deliveryAddress: PropTypes.object.isRequired,
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
