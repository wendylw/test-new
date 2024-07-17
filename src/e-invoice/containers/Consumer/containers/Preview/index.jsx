import React from 'react';
import { useSelector } from 'react-redux';
import { getIsMalaysianType } from '../../redux/common/selector';
import EInvoiceConsumerMalaysianPreview from './MalaysianPreview';
import EInvoiceConsumerNonMalaysianPreview from './NonMalaysianPreview';

const EInvoiceConsumerPreview = () => {
  const isMalaysianType = useSelector(getIsMalaysianType);

  return isMalaysianType ? <EInvoiceConsumerMalaysianPreview /> : <EInvoiceConsumerNonMalaysianPreview />;
};

EInvoiceConsumerPreview.displayName = 'EInvoiceConsumerPreview';

export default EInvoiceConsumerPreview;
