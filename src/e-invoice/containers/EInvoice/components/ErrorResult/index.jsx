import React from 'react';
import { useSelector } from 'react-redux';
import { WarningCircle } from 'phosphor-react';
import { ClockCountdown } from '../../../../../common/components/Icons';
import { GET_E_INVOICE_STATUS_ERROR_CODES, SUBMITTED_TIMEOUT_ERROR_MESSAGE } from '../../../../utils/constants';
import { GET_E_INVOICE_ERROR_CODES } from '../../utils/constants';
import { getEInvoiceErrorResultInfo } from '../../redux/selectors';
import ContentResult from '../../../../components/ContentResult';

const ErrorResult = () => {
  const ERROR_ICONS = {
    [GET_E_INVOICE_ERROR_CODES.ORDER_NOT_FOUND]: <ClockCountdown siz="80" fill="#FF9419" />,
    [GET_E_INVOICE_ERROR_CODES.ORDER_TRANSACTION_TYPE_NOT_SUPPORT]: (
      <WarningCircle size={80} weight="fill" color="#E15343" />
    ),
    [GET_E_INVOICE_ERROR_CODES.ORDER_CANCELLED_OR_REFUNDED]: <WarningCircle size={80} weight="fill" color="#E15343" />,
    [GET_E_INVOICE_STATUS_ERROR_CODES.NO_E_INVOICE_SUBMIT_RECORD]: (
      <WarningCircle size={80} weight="fill" color="#E15343" />
    ),
    [SUBMITTED_TIMEOUT_ERROR_MESSAGE]: <WarningCircle size={80} weight="fill" color="#E15343" />,
  };
  const errorResultInfo = useSelector(getEInvoiceErrorResultInfo);
  const { code, title, description } = errorResultInfo || {};

  return <ContentResult show={!!errorResultInfo} icon={ERROR_ICONS[code]} title={title} description={description} />;
};

ErrorResult.displayName = 'ErrorResult';

export default ErrorResult;
