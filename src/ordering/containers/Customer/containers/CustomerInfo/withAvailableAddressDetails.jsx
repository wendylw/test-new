/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { selectAvailableAddress } from './redux/thunks';
import { getIsSelectAvailableAddressRequestCompleted } from './redux/selectors';
import { getSavedAddressId } from '../../../../../redux/modules/address/selectors';
import { getDeliveryAddressId, getHasFetchDeliveryDetailsRequestCompleted } from '../../../../redux/modules/app';
import PageLoader from '../../../../../components/PageLoader';

export const withAvailableAddressDetails = () => InnerComponent => {
  const WithAvailableAddressDetails = ({
    savedAddressId,
    deliveryAddressId,
    hasFetchDeliveryDetailsRequestCompleted,
    loadAvailableAddress,
    isSelectAvailableAddressRequestCompleted,
    ...otherProps
  }) => {
    const [shouldShowLoader, setShouldShowLoader] = useState(true);
    const shouldLoadAvailableAddress = useMemo(
      () => !savedAddressId || (hasFetchDeliveryDetailsRequestCompleted && !deliveryAddressId),
      [savedAddressId, deliveryAddressId, hasFetchDeliveryDetailsRequestCompleted]
    );

    useEffect(() => {
      if (shouldLoadAvailableAddress) {
        loadAvailableAddress();
      }
    }, [shouldLoadAvailableAddress, loadAvailableAddress]);

    useEffect(() => {
      if (deliveryAddressId || isSelectAvailableAddressRequestCompleted) {
        setShouldShowLoader(false);
      }
    }, [deliveryAddressId, isSelectAvailableAddressRequestCompleted]);

    return <>{shouldShowLoader ? <PageLoader /> : <InnerComponent {...otherProps} />}</>;
  };
  WithAvailableAddressDetails.displayName = 'WithAvailableAddressDetails';
  WithAvailableAddressDetails.propTypes = {
    savedAddressId: PropTypes.string,
    deliveryAddressId: PropTypes.string,
    loadAvailableAddress: PropTypes.func,
    hasFetchDeliveryDetailsRequestCompleted: PropTypes.bool,
    isSelectAvailableAddressRequestCompleted: PropTypes.bool,
  };

  WithAvailableAddressDetails.defaultProps = {
    savedAddressId: null,
    deliveryAddressId: null,
    loadAvailableAddress: () => {},
    hasFetchDeliveryDetailsRequestCompleted: false,
    isSelectAvailableAddressRequestCompleted: false,
  };
  return compose(
    connect(
      state => ({
        savedAddressId: getSavedAddressId(state),
        deliveryAddressId: getDeliveryAddressId(state),
        hasFetchDeliveryDetailsRequestCompleted: getHasFetchDeliveryDetailsRequestCompleted(state),
        isSelectAvailableAddressRequestCompleted: getIsSelectAvailableAddressRequestCompleted(state),
      }),
      dispatch => ({
        loadAvailableAddress: bindActionCreators(selectAvailableAddress, dispatch),
      })
    )
  )(WithAvailableAddressDetails);
};
