import React from 'react';
import PropTypes from 'prop-types';
import './Loader.scss';

function Loader({ processing, loaderText }) {
  if (!processing) {
    return null;
  }

  return (
    <div className="page-loader flex flex-middle flex-center">
      <div className="prompt-loader padding-small border-radius-large text-center flex flex-middle flex-center">
        <div className="prompt-loader__content">
          <i className="circle-loader margin-smaller"></i>
          {loaderText ? (
            <span className="prompt-loader__text margin-top-bottom-smaller text-size-smaller">{loaderText}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

Loader.propTypes = {
  processing: PropTypes.bool,
};

Loader.defaultProps = {
  processing: false,
};

export default Loader;
