import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions } from '../redux';
import { submitOrders as submitOrdersThunk } from '../redux/thunks';
import Constants from '../../../../utils/constants';
import {
  getOrderSubmissionRequestingStatus,
  getSubmitOrderConfirmDisplayStatus,
  getOrderCompletedStatus,
} from '../redux/selectors';
import PageProcessingLoader from '../../../components/PageProcessingLoader';
import Modal from '../../../../components/Modal';
import { alert } from '../../../../common/feedback';
import Utils from '../../../../utils/utils';
import { getShippingType } from '../../../redux/modules/app';

const { ROUTER_PATHS } = Constants;

function SubmitOrderConfirm({
  displaySubmitOrderConfirm,
  updateSubmitOrderConfirmDisplay,
  processing,
  orderCompletedStatus,
  submitOrders,
  history,
  shippingType,
}) {
  const { t } = useTranslation('OrderingTableSummary');

  const handleToggleModal = useCallback(
    status => {
      updateSubmitOrderConfirmDisplay(status);
    },
    [updateSubmitOrderConfirmDisplay]
  );

  return (
    <>
      <Modal className="submit-order-confirm" show={displaySubmitOrderConfirm}>
        <Modal.Body className="text-center padding-small">
          <h2 className="padding-small text-size-biggest text-line-height-base text-weight-bolder text-capitalize">
            {t('PayNow')}
          </h2>
          <p className="submit-order-confirm__description padding-small text-size-big text-line-height-higher">
            {t('SubmitOrderPromptDescription')}
          </p>
        </Modal.Body>
        <Modal.Footer className="flex flex-stretch">
          <button
            className="submit-order-confirm__default-button button button__link flex__fluid-content text-weight-bolder text-uppercase"
            onClick={() => handleToggleModal(false)}
          >
            {t('GoBack')}
          </button>
          <button
            className="submit-order-confirm__fill-button button button__fill flex__fluid-content text-weight-bolder text-uppercase"
            onClick={async () => {
              try {
                const { redirectUrl: thankYouPageUrl } = await submitOrders().unwrap();

                if (orderCompletedStatus && thankYouPageUrl) {
                  // Add "type" into thankYouPageUrl query
                  const urlObj = new URL(thankYouPageUrl, window.location.origin);
                  urlObj.set('type', shippingType);

                  window.location.href = urlObj.toString();
                } else {
                  history.push({
                    pathname: ROUTER_PATHS.ORDERING_PAYMENT,
                    search: window.location.search,
                  });
                }
              } catch (e) {
                // '393731' means missing parameter, '393732' means order not found
                // '393735' means order payment locked,'393738' means order not latest
                if (e.code === '393731') {
                  const removeReceiptNumberUrl = Utils.getFilteredQueryString('receiptNumber');

                  alert(t('SorryDescription'), {
                    title: t('Sorry'),
                    closeButtonContent: t('BackToMenu'),
                    onClose: () =>
                      history.push({
                        pathname: Constants.ROUTER_PATHS.ORDERING_BASE,
                        search: removeReceiptNumberUrl,
                      }),
                  });
                } else if (e.code === '393732') {
                  const removeReceiptNumberUrl = Utils.getFilteredQueryString('receiptNumber');
                  alert(t('OrderNotFoundDescription'), {
                    title: t('Sorry'),
                    closeButtonContent: t('BackToMenu'),
                    onClose: () =>
                      history.push({
                        pathname: Constants.ROUTER_PATHS.ORDERING_BASE,
                        search: removeReceiptNumberUrl,
                      }),
                  });
                } else if (e.code === '393735') {
                  alert(t('SomeoneElseIsPayingDescription'), {
                    title: t('SomeoneElseIsPaying'),
                    closeButtonContent: t('BackToTableSummary'),
                    onClose: () =>
                      history.push({
                        pathname: Constants.ROUTER_PATHS.ORDERING_TABLE_SUMMARY,
                        search: window.location.search,
                      }),
                  });
                } else if (e.code === '393738') {
                  alert(t('RefreshTableSummaryDescription'), {
                    title: t('RefreshTableSummary'),
                    closeButtonContent: t('Refresh'),
                    onClose: () => window.location.reload(),
                  });
                }
              }
            }}
          >
            {t('PayNow')}
          </button>
        </Modal.Footer>
      </Modal>
      <PageProcessingLoader show={processing} loaderText={t('Processing')} />
    </>
  );
}

SubmitOrderConfirm.displayName = 'SubmitOrderConfirm';

SubmitOrderConfirm.propTypes = {
  displaySubmitOrderConfirm: PropTypes.bool,
  updateSubmitOrderConfirmDisplay: PropTypes.func,
  processing: PropTypes.bool,
  orderCompletedStatus: PropTypes.bool,
  submitOrders: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object,
  shippingType: PropTypes.string,
};

SubmitOrderConfirm.defaultProps = {
  displaySubmitOrderConfirm: false,
  updateSubmitOrderConfirmDisplay: () => {},
  processing: false,
  orderCompletedStatus: false,
  submitOrders: () => {},
  history: {},
  shippingType: '',
};

export default connect(
  state => ({
    displaySubmitOrderConfirm: getSubmitOrderConfirmDisplayStatus(state),
    processing: getOrderSubmissionRequestingStatus(state),
    orderCompletedStatus: getOrderCompletedStatus(state),
    shippingType: getShippingType(state),
  }),
  {
    submitOrders: submitOrdersThunk,
    updateSubmitOrderConfirmDisplay: actions.updateSubmitOrderConfirmDisplay,
  }
)(SubmitOrderConfirm);
