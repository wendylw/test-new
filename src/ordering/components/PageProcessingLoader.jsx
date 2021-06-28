import React from 'react';
import PropTypes from 'prop-types';
import './Loader.scss';

function PageProcessingLoader({ loaderText }) {
  return (
    <div className="page-loader flex flex-middle flex-center">
      <div className="prompt-loader padding-small border-radius-large text-center flex flex-middle flex-center">
        <div className="prompt-loader__content">
          <i className="circle-loader margin-smaller" />
          {loaderText ? (
            <span className="prompt-loader__text margin-top-bottom-smaller text-size-smaller">{loaderText}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

PageProcessingLoader.propTypes = {
  loaderText: PropTypes.string,
};

PageProcessingLoader.defaultProps = {
  loaderText: null,
};

export default PageProcessingLoader;
