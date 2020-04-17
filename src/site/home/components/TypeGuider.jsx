import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import config from '../../../config';
import RedirectForm from '../../../ordering/containers/Payment/components/RedirectForm';
import Utils from '../../utils/utils';

class TypeGuider extends Component {
  state = {
    url: '',
  };

  redirectForm = React.createRef();

  componentDidUpdate(prevProps, prevState, snapshot) {
    // make auto redirect once store is closed
    if (this.props.deliveryUrl && !this.state.url && !this.props.isOpen) {
      this.setState(
        {
          url: this.props.deliveryUrl,
        },
        () => {
          this.state.url = '';
          this.props.onRedirect();
          this.redirectForm.current.submit(); // the form uses real url, not the one empty
        }
      );
    }
  }

  handleHideTypeGuider(e) {
    const { onToggle } = this.props;

    if (e && e.target !== e.currentTarget) {
      return;
    }

    return onToggle();
  }

  handleGotoOrderingPage(url, action) {
    if (action) {
      Utils.removeExpectedDeliveryTime();
      this.setState({ url }, () => {
        this.state.url = '';
        this.props.onRedirect();
        this.redirectForm.current.submit(); // the form uses real url, not the one empty
      });
    }
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
        ref={this.redirectForm}
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
        <div className="type-guider-aside__content aside__content absolute-wrapper padding-normal text-center">
          <h2 className="padding-small text-size-biggest text-weight-bolder">{currentText.title}</h2>
          {currentText.description ? (
            <p className="type-guider-aside__description padding-top-bottom-normal text-opacity">
              {currentText.description}
            </p>
          ) : null}
          {loading ? (
            this.renderLoading()
          ) : (
            <div className="type-guider-aside__button-group flex flex-middle flex-space-between">
              <button
                className="button button__block button__outline margin-normal text-uppercase text-weight-bolder"
                onClick={this.handleGotoOrderingPage.bind(this, pickupUrl, true)}
              >
                {t('SelfPickup')}
              </button>
              <button
                className="button button__block button__fill margin-normal text-uppercase text-weight-bolder"
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
  business: PropTypes.string,
  deliveryAddress: PropTypes.object,
  deliveryUrl: PropTypes.string,
  pickupUrl: PropTypes.string,
  isOutOfDeliveryRange: PropTypes.bool,
  show: PropTypes.bool.isRequired,
  onToggle: PropTypes.func,
  onRedirect: PropTypes.func,
};

TypeGuider.defaultProps = {
  isOutOfDeliveryRange: false,
  show: false,
  onToggle: () => {},
  onRedirect: () => {},
};

export default withTranslation()(TypeGuider);
