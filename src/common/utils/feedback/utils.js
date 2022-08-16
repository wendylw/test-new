import ReactDOM from 'react-dom';

/**
 * Feedback Status for message, modal, notification
 */
export const FEEDBACK_STATUS = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  WARNING: 'WARNING',
  INFO: 'INFO',
};

export const destroyTarget = target => {
  ReactDOM.unmountComponentAtNode(target);

  target.remove();
};

export class BeepError extends Error {
  statusCode = 400;

  constructor(message, options = {}) {
    const { code, statusCode, ...resetOptions } = options;
    super(message);

    Object.setPrototypeOf(this, BeepError.prototype);

    this.code = options.code;
    this.statusCode = options.statusCode;
    this.extraInfo = resetOptions;
  }

  getErrorCode() {
    return this.code;
  }

  getErrorMessage() {
    return this.message;
  }
}
