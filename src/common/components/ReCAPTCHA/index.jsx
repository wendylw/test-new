// This file is copied from https://github.com/dozoisch/react-google-recaptcha and modified to fit the needs of this project.
// We will track following events:
// PR: https://github.com/dozoisch/react-google-recaptcha/pull/239
// Issues: https://github.com/dozoisch/react-google-recaptcha/issues/228
// Once the original repo meets the needs of the enterprise version, we will remove this file and directly import the 'react-google-recaptcha' library.
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/sort-comp */
/* eslint-disable no-else-return */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import * as React from 'react';
import PropTypes from 'prop-types';
import makeAsyncScriptLoader from 'react-async-script';

class ReCAPTCHA extends React.Component {
  constructor() {
    super();
    this.handleExpired = this.handleExpired.bind(this);
    this.handleErrored = this.handleErrored.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleRecaptchaRef = this.handleRecaptchaRef.bind(this);
  }

  getValue() {
    // Use 'grecaptcha.enterprise' instead of 'grecaptcha' to fit the enterprise version according to the Google ReCAPTCHA guide.
    // Ref: https://cloud.google.com/recaptcha-enterprise/docs/using-features
    if (this.props.grecaptcha && this.props.grecaptcha.enterprise && this._widgetId !== undefined) {
      return this.props.grecaptcha.enterprise.getResponse(this._widgetId);
    }
    return null;
  }

  getWidgetId() {
    if (this.props.grecaptcha && this._widgetId !== undefined) {
      return this._widgetId;
    }
    return null;
  }

  execute() {
    const { grecaptcha } = this.props;

    // Use 'grecaptcha.enterprise' instead of 'grecaptcha' to fit the enterprise version according to the Google ReCAPTCHA guide.
    // Ref: https://cloud.google.com/recaptcha-enterprise/docs/using-features
    if (grecaptcha && grecaptcha.enterprise && this._widgetId !== undefined) {
      return grecaptcha.enterprise.execute(this._widgetId);
    } else {
      this._executeRequested = true;
    }
  }

  executeAsync() {
    return new Promise((resolve, reject) => {
      this.executionResolve = resolve;
      this.executionReject = reject;
      this.execute();
    });
  }

  reset() {
    // Use 'grecaptcha.enterprise' instead of 'grecaptcha' to fit the enterprise version according to the Google ReCAPTCHA guide.
    // Ref: https://cloud.google.com/recaptcha-enterprise/docs/using-features
    if (this.props.grecaptcha && this.props.grecaptcha.enterprise && this._widgetId !== undefined) {
      this.props.grecaptcha.enterprise.reset(this._widgetId);
    }
  }

  forceReset() {
    // Use 'grecaptcha.enterprise' instead of 'grecaptcha' to fit the enterprise version according to the Google ReCAPTCHA guide.
    // Ref: https://cloud.google.com/recaptcha-enterprise/docs/using-features
    if (this.props.grecaptcha && this.props.grecaptcha.enterprise) {
      this.props.grecaptcha.enterprise.reset();
    }
  }

  handleExpired() {
    if (this.props.onExpired) {
      this.props.onExpired();
    } else {
      this.handleChange(null);
    }
  }

  handleErrored() {
    if (this.props.onErrored) {
      this.props.onErrored();
    }
    if (this.executionReject) {
      this.executionReject();
      delete this.executionResolve;
      delete this.executionReject;
    }
  }

  handleChange(token) {
    if (this.props.onChange) {
      this.props.onChange(token);
    }
    if (this.executionResolve) {
      this.executionResolve(token);
      delete this.executionReject;
      delete this.executionResolve;
    }
  }

  explicitRender() {
    // Use 'grecaptcha.enterprise' instead of 'grecaptcha' to fit the enterprise version according to the Google ReCAPTCHA guide.
    // Ref: https://cloud.google.com/recaptcha-enterprise/docs/using-features
    if (this.props.grecaptcha && this.props.grecaptcha.enterprise?.render && this._widgetId === undefined) {
      const wrapper = document.createElement('div');
      this._widgetId = this.props.grecaptcha.enterprise.render(wrapper, {
        sitekey: this.props.sitekey,
        callback: this.handleChange,
        theme: this.props.theme,
        type: this.props.type,
        tabindex: this.props.tabindex,
        'expired-callback': this.handleExpired,
        'error-callback': this.handleErrored,
        size: this.props.size,
        stoken: this.props.stoken,
        hl: this.props.hl,
        badge: this.props.badge,
        isolated: this.props.isolated,
      });
      this.captcha.appendChild(wrapper);
    }
    // Use 'grecaptcha.enterprise' instead of 'grecaptcha' to fit the enterprise version according to the Google ReCAPTCHA guide.
    // Ref: https://cloud.google.com/recaptcha-enterprise/docs/using-features
    if (
      this._executeRequested &&
      this.props.grecaptcha &&
      this.props.grecaptcha.enterprise &&
      this._widgetId !== undefined
    ) {
      this._executeRequested = false;
      this.execute();
    }
  }

  componentDidMount() {
    this.explicitRender();
  }

  componentDidUpdate() {
    this.explicitRender();
  }

  handleRecaptchaRef(elem) {
    this.captcha = elem;
  }

  render() {
    // consume properties owned by the reCATPCHA, pass the rest to the div so the user can style it.
    /* eslint-disable no-unused-vars */
    const {
      sitekey,
      onChange,
      theme,
      type,
      tabindex,
      onExpired,
      onErrored,
      size,
      stoken,
      grecaptcha,
      badge,
      hl,
      isolated,
      ...childProps
    } = this.props;
    /* eslint-enable no-unused-vars */
    return <div {...childProps} ref={this.handleRecaptchaRef} />;
  }
}

ReCAPTCHA.displayName = 'ReCAPTCHA';
ReCAPTCHA.propTypes = {
  sitekey: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  grecaptcha: PropTypes.object,
  theme: PropTypes.oneOf(['dark', 'light']),
  type: PropTypes.oneOf(['image', 'audio']),
  tabindex: PropTypes.number,
  onExpired: PropTypes.func,
  onErrored: PropTypes.func,
  size: PropTypes.oneOf(['compact', 'normal', 'invisible']),
  stoken: PropTypes.string,
  hl: PropTypes.string,
  badge: PropTypes.oneOf(['bottomright', 'bottomleft', 'inline']),
  isolated: PropTypes.bool,
};
ReCAPTCHA.defaultProps = {
  onChange: () => {},
  theme: 'light',
  type: 'image',
  tabindex: 0,
  size: 'normal',
  badge: 'bottomright',
};

const callbackName = 'onloadCallback';
export const globalName = 'grecaptcha';

function getOptions() {
  return (typeof window !== 'undefined' && window.recaptchaOptions) || {};
}

function getURL() {
  const dynamicOptions = getOptions();
  const hostname = dynamicOptions.useRecaptchaNet ? 'recaptcha.net' : 'www.google.com';
  // Use 'enterprise.js' instead of 'api.js' to fit the enterprise version according to the Google ReCAPTCHA guide.
  // Ref: https://cloud.google.com/recaptcha-enterprise/docs/using-features
  return `https://${hostname}/recaptcha/enterprise.js?onload=${callbackName}&render=explicit`;
}

export default makeAsyncScriptLoader(getURL, {
  callbackName,
  globalName,
  attributes: getOptions().nonce ? { nonce: getOptions().nonce } : {},
})(ReCAPTCHA);
