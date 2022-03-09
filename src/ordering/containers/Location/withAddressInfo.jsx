/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PageLoader from '../../../components/PageLoader';
import { getIsAddressRequestStatusPending } from '../../../redux/modules/address/selectors';

export const withAddressInfo = () => InnerComponent => {
  const WithAddressInfo = ({ isRequestStatusPending, ...otherProps }) => {
    const [shouldShowLoader, setShouldShowLoader] = useState(true);

    useEffect(() => {
      if (!isRequestStatusPending) {
        setShouldShowLoader(false);
      }
    }, [isRequestStatusPending]);

    return <>{shouldShowLoader ? <PageLoader /> : <InnerComponent {...otherProps} />}</>;
  };
  WithAddressInfo.displayName = 'WithAddressInfo';
  WithAddressInfo.propTypes = {
    isRequestStatusPending: PropTypes.bool,
  };

  WithAddressInfo.defaultProps = {
    isRequestStatusPending: false,
  };
  return connect(state => ({
    isRequestStatusPending: getIsAddressRequestStatusPending(state),
  }))(WithAddressInfo);
};
