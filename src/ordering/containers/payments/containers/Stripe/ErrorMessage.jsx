import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = ({ errors }) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <span className="form__error-message padding-left-right-normal margin-top-bottom-small" role="alert">
      {errors.map((error, index) => (
        <div
          style={{
            lineHeight: '1.8em',
          }}
          // eslint-disable-next-line react/no-array-index-key
          key={index}
        >
          {error.message}
        </div>
      ))}
    </span>
  );
};

ErrorMessage.displayName = 'StripeErrorMessage';

ErrorMessage.propTypes = {
  // eslint-disable-next-line react/require-default-props
  errors: PropTypes.arrayOf(PropTypes.object),
};

ErrorMessage.defaultProps = {
  errors: [],
};

export default ErrorMessage;
