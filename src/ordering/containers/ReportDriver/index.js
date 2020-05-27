import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';

import Constants from '../../../utils/constants';
import PageLoader from '../../../components/PageLoader';
import feedBackThankyou from '../../../images/feedback-thankyou.png';
import uploadImage from '../../../images/upload-image.svg';
import Header from '../../../components/Header';
import {
  actions as reportDriverActionCreators,
  getCommonIssuesCodes,
  getInputNotes,
  getSelectedCommonIssues,
  getSubmitStatus,
  getShowLoading,
  SUBMIT_STATUS,
  CAN_REPORT_STATUS_LIST,
} from '../../redux/modules/reportDriver';
import {
  actions as thankyouActionCreators,
  getIsUseStorehubLogistics,
  getOrderStatus,
  getReceiptNumber,
} from '../../redux/modules/thankYou';

const NOTE_MAX_LENGTH = 140;

class ReportDriver extends Component {
  componentDidMount() {
    const { receiptNumber, thankyouActions, reportDriverActions } = this.props;

    thankyouActions.loadOrder(receiptNumber);
    reportDriverActions.fetchReport();
  }

  handleGoBack = () => {
    this.gotoThankYourPage();
  };

  handleDone = () => {
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
    this.props.reportDriverActions.updateInputNodes(notes);
  };

  toggleCommonIssue = CommonIssueCode => {
    const { reportDriverActions, selectedCommonIssues } = this.props;
    if (selectedCommonIssues.has(CommonIssueCode)) {
      reportDriverActions.removeSelectedCommonIssues(CommonIssueCode);
    } else {
      reportDriverActions.addSelectedCommonIssues(CommonIssueCode);
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
    await this.props.reportDriverActions.submitReport();
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

  renderThankYou() {
    const { t } = this.props;
    return (
      <section className="table-ordering__report-driver-thankyou">
        <Header
          className="report-driver__header flex-middle"
          isPage={false}
          title={t('ReportDriver')}
          navFunc={this.handleGoBack}
        ></Header>
        <div className="report-driver-thankyou__image">
          <img alt="Thank your feedback" src={feedBackThankyou} />
        </div>
        <h3 className="report-driver-thankyou__title">{t('Thankyou')}</h3>
        <main className="report-driver-thankyou__content">{t('ThankyouYourFeedbackContent')}</main>
        <div className="report-driver-thankyou__done-button">
          <button onClick={this.handleDone}>{t('Done')}</button>
        </div>
      </section>
    );
  }

  render() {
    const { t, inputNotes, selectedCommonIssues, commonIssuesCodes, submitStatus, showLoading } = this.props;
    const disabled = submitStatus !== SUBMIT_STATUS.NOT_SUBMIT;

    if (showLoading) {
      return <PageLoader />;
    }

    if (submitStatus === SUBMIT_STATUS.SUBMITTED) {
      return this.renderThankYou();
    }

    return (
      <section className="table-ordering__report-driver">
        <Header
          className="report-driver__header flex-middle"
          isPage={false}
          title={t('ReportDriver')}
          navFunc={this.handleGoBack}
        ></Header>
        <main className="report-driver__main">
          <div className="report-driver__select-reason">
            <h3 className="report-driver__select-reason-title">{t('SelectAReportReason')}</h3>
            <ul className="report-driver__select-reason-list">
              <li className="report-driver__select-reason-item">
                <input name="reason" type="radio" />
                <label>Food was damaged</label>
              </li>
              <li className="report-driver__select-reason-item">
                <input name="reason" type="radio" />
                <label>Driver was late</label>
              </li>
              <li className="report-driver__select-reason-item">
                <input name="reason" type="radio" />
                <label>Driver was rude</label>
              </li>
              <li className="report-driver__select-reason-item">
                <input name="reason" type="radio" />
                <label>Driver asked for more money on delivery</label>
              </li>
              <li className="report-driver__select-reason-item">
                <input name="reason" type="radio" />
                <label>Others</label>
              </li>
            </ul>
          </div>
          <div className="report-driver__note">
            <h3 className="report-driver__note-title">{t('Notes')}</h3>
            <textarea
              className="report-driver__note-textarea"
              placeholder={disabled ? '' : t('NoteFieldPlaceholder')}
              rows="5"
              maxLength={NOTE_MAX_LENGTH}
              value={inputNotes}
              onChange={this.handleNotesChange}
              disabled={disabled}
            ></textarea>
            <div className="report-driver__note-char-length">
              {t('LimitCharacters', { inputLength: inputNotes.length, maxLength: NOTE_MAX_LENGTH })}
            </div>
          </div>
          <div className="report-driver__upload-photo">
            <h3 className="report-driver__upload-photo-title">
              {t('UploadPhoto')} ({t('Common:Required')})
            </h3>
            <div className="report-driver__upload-photo-uploader">
              <input type="file" />
              <div className="report-driver__upload-photo-reminder">
                <img alt="upload" src={uploadImage} />
                <p>{t('UploadFileHere')}</p>
              </div>
            </div>
          </div>
          <div className="report-driver__submit">
            <button
              className="report-driver__submit-button"
              disabled={this.isSubmitButtonDisable()}
              onClick={this.handleSubmit}
            >
              {this.renderSubmitButtonContent()}
            </button>
          </div>
        </main>
      </section>
    );
  }
}

export default compose(
  withTranslation(['ReportDriver']),
  connect(
    state => ({
      commonIssuesCodes: getCommonIssuesCodes(state),
      inputNotes: getInputNotes(state),
      selectedCommonIssues: getSelectedCommonIssues(state),
      orderStatus: getOrderStatus(state),
      isUseStorehubLogistics: getIsUseStorehubLogistics(state),
      receiptNumber: getReceiptNumber(state),
      submitStatus: getSubmitStatus(state),
      showLoading: getShowLoading(state),
    }),
    dispatch => ({
      reportDriverActions: bindActionCreators(reportDriverActionCreators, dispatch),
      thankyouActions: bindActionCreators(thankyouActionCreators, dispatch),
    })
  )
)(ReportDriver);
