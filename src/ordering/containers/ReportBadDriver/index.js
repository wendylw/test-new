import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';

import Constants from '../../../utils/constants';
import Header from '../../../components/Header';
import {
  actions as reportBadDriverActionCreators,
  getCommonIssuesCodes,
  getInputNotes,
  getSelectedCommonIssues,
  getSubmitStatus,
  SUBMIT_STATUS,
  CAN_REPORT_STATUS_LIST,
} from '../../redux/modules/reportBadDriver';
import {
  actions as thankyouActionCreators,
  getIsUseStorehubLogistics,
  getOrderStatus,
  getReceiptNumber,
} from '../../redux/modules/thankYou';

const NOTE_MAX_LENGTH = 140;

class ReportBadDriver extends Component {
  componentDidMount() {
    const { receiptNumber, thankyouActions, reportBadDriverActions } = this.props;

    thankyouActions.loadOrder(receiptNumber);
    reportBadDriverActions.fetchReport();
  }

  handleGoBack = () => {
    this.gotoThankYourPage();
  };

  gotoThankYourPage = () => {
    const { receiptNumber, history } = this.props;
    const searchParams = {
      receiptNumber,
      type: Constants.DELIVERY_METHOD.DELIVERY,
    };

    history.push({
      pathname: Constants.ROUTER_PATHS.THANK_YOU,
      search: qs.stringify(searchParams, { addQueryPrefix: true }),
    });
  };

  handleNotesChange = e => {
    const notes = e.target.value;
    this.props.reportBadDriverActions.updateInputNodes(notes);
  };

  toggleCommonIssue = CommonIssueCode => {
    const { reportBadDriverActions, selectedCommonIssues } = this.props;
    if (selectedCommonIssues.has(CommonIssueCode)) {
      reportBadDriverActions.removeSelectedCommonIssues(CommonIssueCode);
    } else {
      reportBadDriverActions.addSelectedCommonIssues(CommonIssueCode);
    }
  };

  isOrderCanReportDriver = () => {
    const { orderStatus, isUseStorehubLogistics } = this.props;

    return CAN_REPORT_STATUS_LIST.includes(orderStatus) && isUseStorehubLogistics;
  };

  isSubmitButtonDisable = () => {
    const { inputNotes, submitStatus } = this.props;

    if (!this.isOrderCanReportDriver()) {
      return true;
    }

    if (inputNotes.trim().length === 0) {
      return true;
    }

    if (submitStatus !== SUBMIT_STATUS.NOT_SUBMIT) {
      return true;
    }

    return false;
  };

  handleSubmit = async () => {
    await this.props.reportBadDriverActions.submitReport();
    this.gotoThankYourPage();
  };

  renderSubmitButtonContent = () => {
    const { t, submitStatus } = this.props;
    switch (submitStatus) {
      case SUBMIT_STATUS.NOT_SUBMIT:
        return t('Submit');
      case SUBMIT_STATUS.IN_PROGRESS:
        return <div className="loader"></div>;
      case SUBMIT_STATUS.SUBMITTED:
        return t('Submitted');
      default:
        return t('Submit');
    }
  };

  render() {
    const { t, inputNotes, selectedCommonIssues, commonIssuesCodes, submitStatus } = this.props;
    const disabled = submitStatus !== SUBMIT_STATUS.NOT_SUBMIT;

    return (
      <section className="table-ordering__report-bad-driver">
        <Header
          className="report-bad-driver__header flex-middle"
          isPage={false}
          title={t('ReportDriver')}
          navFunc={this.handleGoBack}
        ></Header>
        <h2 className="report-bad-driver__title">{t('ReportYourDriver')}</h2>
        <main className="report-bad-driver__main">
          <div className="report-bad-driver__note">
            <textarea
              className="report-bad-driver__note-textarea"
              placeholder={disabled ? '' : t('NoteFieldPlaceholder')}
              rows="5"
              maxLength={NOTE_MAX_LENGTH}
              value={inputNotes}
              onChange={this.handleNotesChange}
              disabled={disabled}
            ></textarea>
            <div className="report-bad-driver__note-char-length">
              {t('LimitCharacters', { inputLength: inputNotes.length, maxLength: NOTE_MAX_LENGTH })}
            </div>
          </div>
          <div className="report-bad-driver__common-issues">
            <h3 className="report-bad-driver__common-issues-title">{t('CommonIssues')}</h3>
            <ul className="report-bad-driver__common-issues-list">
              {commonIssuesCodes.map(code => {
                const active = selectedCommonIssues.has(code) ? 'active' : '';
                return (
                  <li key={code} className={`report-bad-driver__common-issues-list-item ${active}`}>
                    <button
                      disabled={disabled}
                      onClick={() => {
                        this.toggleCommonIssue(code);
                      }}
                      className="report-bad-driver__common-issues-button"
                    >
                      {t(`CommonIssues_${code}`)}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="report-bad-driver__submit">
              <button
                className="report-bad-driver__submit-button"
                disabled={this.isSubmitButtonDisable()}
                onClick={this.handleSubmit}
              >
                {this.renderSubmitButtonContent()}
              </button>
            </div>
          </div>
        </main>
      </section>
    );
  }
}

export default compose(
  withTranslation(['ReportBadDriver']),
  connect(
    state => ({
      commonIssuesCodes: getCommonIssuesCodes(state),
      inputNotes: getInputNotes(state),
      selectedCommonIssues: getSelectedCommonIssues(state),
      orderStatus: getOrderStatus(state),
      isUseStorehubLogistics: getIsUseStorehubLogistics(state),
      receiptNumber: getReceiptNumber(state),
      submitStatus: getSubmitStatus(state),
    }),
    dispatch => ({
      reportBadDriverActions: bindActionCreators(reportBadDriverActionCreators, dispatch),
      thankyouActions: bindActionCreators(thankyouActionCreators, dispatch),
    })
  )
)(ReportBadDriver);
