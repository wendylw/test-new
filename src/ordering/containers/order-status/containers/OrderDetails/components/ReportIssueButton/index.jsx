import qs from 'qs';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CaretRight } from 'phosphor-react';
import { PATH_NAME_MAPPING } from '../../../../../../../common/utils/constants';
import {
  getIsUseStorehubLogistics,
  getReceiptNumber,
  getIsReportUnsafeDriverButtonDisabled,
} from '../../../../redux/selector';

const ReportIssueButton = ({ pushCleverTapEvent }) => {
  const { t } = useTranslation(['OrderingThankYou']);
  const history = useHistory();
  const isUseStorehubLogistics = useSelector(getIsUseStorehubLogistics);
  const receiptNumber = useSelector(getReceiptNumber);
  const isReportUnsafeDriverButtonDisabled = useSelector(getIsReportUnsafeDriverButtonDisabled);
  const handleClickReportIssueButton = useCallback(() => {
    pushCleverTapEvent('Order Details - click report issue');

    history.push({
      pathname: PATH_NAME_MAPPING.REPORT_DRIVER,
      search: qs.stringify(
        {
          receiptNumber,
          from: 'orderDetails',
        },
        { addQueryPrefix: true }
      ),
    });
  }, [history, receiptNumber, pushCleverTapEvent]);

  if (!isUseStorehubLogistics) {
    return null;
  }

  return (
    <div className="card margin-small">
      <button
        disabled={isReportUnsafeDriverButtonDisabled}
        onClick={handleClickReportIssueButton}
        className="ordering-details__report-issue-button button button__block flex flex-middle flex-space-between padding-small"
        data-test-id="ordering.feature-buttons.report-driver-btn"
      >
        <span className="text-left text-size-big flex__fluid-content padding-left-right-smaller">
          {t('ReportIssue')}
        </span>
        <CaretRight size={24} />
      </button>
    </div>
  );
};

ReportIssueButton.displayName = 'ReportIssueButton';

ReportIssueButton.propTypes = {
  pushCleverTapEvent: PropTypes.func,
};

ReportIssueButton.defaultProps = {
  pushCleverTapEvent: () => {},
};

export default ReportIssueButton;
