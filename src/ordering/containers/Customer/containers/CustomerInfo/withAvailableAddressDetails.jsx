/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { selectAvailableAddress } from '../../redux/common/thunks';
import { getIsAddressRequestStatusPending } from '../../../../../redux/modules/address/selectors';
import PageLoader from '../../../../../components/PageLoader';

export const withAvailableAddressDetails = () => InnerComponent => {
  const WithAvailableAddressDetails = ({ isAddressRequestStatusPending, loadAvailableAddress, ...otherProps }) => {
    const [shouldShowLoader, setShouldShowLoader] = useState(true);
    const loadAvailableAddressDetails = useCallback(async () => {
      await loadAvailableAddress();
      setShouldShowLoader(false);
    }, [loadAvailableAddress]);

    useEffect(() => {
      if (!isAddressRequestStatusPending) {
        loadAvailableAddressDetails();
      }
    }, [isAddressRequestStatusPending, loadAvailableAddressDetails]);

    return <>{shouldShowLoader ? <PageLoader /> : <InnerComponent {...otherProps} />}</>;
  };
  WithAvailableAddressDetails.displayName = 'WithAddressInfo';
  WithAvailableAddressDetails.propTypes = {
    isAddressRequestStatusPending: PropTypes.bool,
    loadAvailableAddress: PropTypes.func,
  };

  WithAvailableAddressDetails.defaultProps = {
    isAddressRequestStatusPending: false,
    loadAvailableAddress: () => {},
  };
  return compose(
    connect(
      state => ({ isAddressRequestStatusPending: getIsAddressRequestStatusPending(state) }),
      dispatch => ({
        loadAvailableAddress: bindActionCreators(selectAvailableAddress, dispatch),
      })
    )
  )(WithAvailableAddressDetails);
};
