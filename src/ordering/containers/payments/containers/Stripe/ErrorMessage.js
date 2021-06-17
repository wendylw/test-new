import React from 'react';

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
          key={index}
        >
          {error.message}
        </div>
      ))}
    </span>
  );
};
ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;
