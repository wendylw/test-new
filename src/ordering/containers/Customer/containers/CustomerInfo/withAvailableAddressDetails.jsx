/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { selectAvailableAddress } from '../../redux/common/thunks';
import { getSavedAddressId } from '../../../../../redux/modules/address/selectors';
import { getDeliveryAddressId, getHasFetchDeliveryDetailsRequestCompleted } from '../../../../redux/modules/app';
import PageLoader from '../../../../../components/PageLoader';

export const withAvailableAddressDetails = () => InnerComponent => {
  const WithAvailableAddressDetails = ({
    savedAddressId,
    deliveryAddressId,
    hasFetchRequestCompleted,
    loadAvailableAddress,
    ...otherProps
  }) => {
    const [shouldShowLoader, setShouldShowLoader] = useState(true);
    const shouldLoadAvailableAddress = useMemo(
      () => !savedAddressId || (hasFetchRequestCompleted && !deliveryAddressId),
      [savedAddressId, deliveryAddressId, hasFetchRequestCompleted]
    );

    useEffect(() => {
      if (shouldLoadAvailableAddress) {
        loadAvailableAddress();
      }
    }, [shouldLoadAvailableAddress, loadAvailableAddress]);

    useEffect(() => {
      if (deliveryAddressId) {
        setShouldShowLoader(false);
      }
    }, [deliveryAddressId]);

    return <>{shouldShowLoader ? <PageLoader /> : <InnerComponent {...otherProps} />}</>;
  };
  WithAvailableAddressDetails.displayName = 'WithAddressInfo';
  WithAvailableAddressDetails.propTypes = {
    savedAddressId: PropTypes.string,
    deliveryAddressId: PropTypes.string,
    loadAvailableAddress: PropTypes.func,
    hasFetchRequestCompleted: PropTypes.bool,
  };

  WithAvailableAddressDetails.defaultProps = {
    savedAddressId: null,
    deliveryAddressId: null,
    loadAvailableAddress: () => {},
    hasFetchRequestCompleted: false,
  };
  return compose(
    connect(
      state => ({
        savedAddressId: getSavedAddressId(state),
        deliveryAddressId: getDeliveryAddressId(state),
        hasFetchRequestCompleted: getHasFetchDeliveryDetailsRequestCompleted(state),
      }),
      dispatch => ({
        loadAvailableAddress: bindActionCreators(selectAvailableAddress, dispatch),
      })
    )
  )(WithAvailableAddressDetails);
};
