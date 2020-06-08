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
import Radio from '../../../components/Radio';
import {
  actions as reportDriverActionCreators,
  getInputNotes,
  getSelectedReasonCode,
  getSelectedReasonFields,
  getSubmitStatus,
  getShowPageLoader,
  getUploadPhotoUrl,
  getUploadPhotoFile,
  SUBMIT_STATUS,
  CAN_REPORT_STATUS_LIST,
  REPORT_DRIVER_FIELDS,
  REPORT_DRIVER_REASONS,
} from '../../redux/modules/reportDriver';
import {
  actions as thankyouActionCreators,
  getIsUseStorehubLogistics,
  getOrderStatus,
  getReceiptNumber,
} from '../../redux/modules/thankYou';
import { actions as appActionCreators } from '../../redux/modules/app';
import { IconClose } from '../../../components/Icons';

const NOTE_MAX_LENGTH = 140;
const UPLOAD_FILE_MAX_SIZE = 10 * 1024 * 1024; // 10M

class ReportDriver extends Component {
  componentDidMount() {
    const { receiptNumber, thankyouActions, reportDriverActions } = this.props;

    thankyouActions.loadOrder(receiptNumber);
    reportDriverActions.fetchReport();
  }

  componentWillUnmount() {
    // release the file reference
    this.props.reportDriverActions.removeUploadPhotoFile();
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
    this.props.reportDriverActions.updateInputNotes(notes);
  };

  isOrderCanReportDriver = () => {
    const { orderStatus, isUseStorehubLogistics } = this.props;

    return CAN_REPORT_STATUS_LIST.includes(orderStatus) && isUseStorehubLogistics;
  };

  isInputNotesCanSubmit() {
    const { inputNotes } = this.props;
    return inputNotes.trim().length > 0;
  }

  isUploadPhotoCanSubmit() {
    const { uploadPhotoFile } = this.props;
    return uploadPhotoFile && uploadPhotoFile.size <= UPLOAD_FILE_MAX_SIZE;
  }

  isSubmitButtonDisable = () => {
    const { submitStatus, selectedReasonFields, selectedReasonCode } = this.props;

    if (!this.isOrderCanReportDriver()) {
      return true;
    }

    if (!selectedReasonCode) {
      return true;
    }

    if (selectedReasonFields.includes(REPORT_DRIVER_FIELDS.NOTES) && !this.isInputNotesCanSubmit()) {
      return true;
    }

    if (selectedReasonFields.includes(REPORT_DRIVER_FIELDS.PHOTO) && !this.isUploadPhotoCanSubmit()) {
      return true;
    }

    if (submitStatus !== SUBMIT_STATUS.NOT_SUBMIT) {
      return true;
    }

    return false;
  };

  handleUploadPhoto = e => {
    // File Object https://developer.mozilla.org/en-US/docs/Web/API/File
    const file = e.target.files[0];

    if (file.size > UPLOAD_FILE_MAX_SIZE) {
      this.props.appActions.showError({
        message: this.props.t('UploadPhotoTooLarge', { maxFileSize: UPLOAD_FILE_MAX_SIZE / (1024 * 1024) }),
      });
      // clear the select file
      e.target.value = '';
      return;
    }

    this.props.reportDriverActions.setUploadPhotoFile(file);
  };

  handleRemoveUploadPhoto = () => {
    this.props.reportDriverActions.removeUploadPhotoFile();
  };

  handleSubmit = async () => {
    await this.props.reportDriverActions.submitReport();
  };

  handleSelectReason = reasonCode => {
    this.props.reportDriverActions.selectReasonCode(reasonCode);
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

  renderNotesField({ t, inputNotes, disabled }) {
    return (
      <div className="report-driver__note">
        <h3 className="report-driver__note-title">{t('Notes')}</h3>
        <textarea
          className="report-driver__note-textarea"
          placeholder={disabled ? '' : t('NoteFieldPlaceholder')}
          rows="6"
          maxLength={NOTE_MAX_LENGTH}
          value={inputNotes}
          onChange={this.handleNotesChange}
          disabled={disabled}
        ></textarea>
        <div className="report-driver__note-char-length">
          {t('LimitCharacters', { inputLength: inputNotes.length, maxLength: NOTE_MAX_LENGTH })}
        </div>
      </div>
    );
  }

  renderPhotoField({ t, uploadPhotoFile, uploadPhotoUrl, disabled }) {
    return (
      <div className="report-driver__upload-photo">
        <h3 className="report-driver__upload-photo-title">
          {t('UploadPhoto')} ({t('Common:Required')})
        </h3>
        {uploadPhotoFile ? (
          <div className="report-driver__upload-photo-viewer">
            <img alt="upload file" src={uploadPhotoUrl} />
            {disabled ? null : (
              <button onClick={this.handleRemoveUploadPhoto} className="report-driver__upload-photo-remove-button">
                <IconClose />
              </button>
            )}
          </div>
        ) : (
          <div className="report-driver__upload-photo-uploader">
            <input onChange={this.handleUploadPhoto} type="file" accept="image/*" />
            <div className="report-driver__upload-photo-reminder">
              <img alt="upload" src={uploadImage} />
              <p>{t('UploadFileHere')}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  render() {
    const {
      t,
      inputNotes,
      submitStatus,
      showPageLoader,
      selectedReasonCode,
      selectedReasonFields,
      uploadPhotoFile,
      uploadPhotoUrl,
    } = this.props;
    const disabled = submitStatus !== SUBMIT_STATUS.NOT_SUBMIT;

    if (showPageLoader) {
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
              {REPORT_DRIVER_REASONS.map(({ code, i18n_key }) => {
                return (
                  <li key={code} className="report-driver__select-reason-item">
                    <Radio
                      onChange={() => {
                        this.handleSelectReason(code);
                      }}
                      checked={selectedReasonCode === code}
                      inputId={`reason_${code}`}
                      name="reason"
                      disabled={disabled}
                    />
                    <label htmlFor={`reason_${code}`}>{t(i18n_key)}</label>
                  </li>
                );
              })}
            </ul>
          </div>

          {selectedReasonFields.includes(REPORT_DRIVER_FIELDS.NOTES)
            ? this.renderNotesField({ t, inputNotes, disabled })
            : null}

          {selectedReasonFields.includes(REPORT_DRIVER_FIELDS.PHOTO)
            ? this.renderPhotoField({ t, uploadPhotoFile, uploadPhotoUrl, disabled })
            : null}

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
      inputNotes: getInputNotes(state),
      selectedReasonCode: getSelectedReasonCode(state),
      selectedReasonFields: getSelectedReasonFields(state),
      orderStatus: getOrderStatus(state),
      isUseStorehubLogistics: getIsUseStorehubLogistics(state),
      receiptNumber: getReceiptNumber(state),
      submitStatus: getSubmitStatus(state),
      showPageLoader: getShowPageLoader(state),
      uploadPhotoFile: getUploadPhotoFile(state),
      uploadPhotoUrl: getUploadPhotoUrl(state),
    }),
    dispatch => ({
      reportDriverActions: bindActionCreators(reportDriverActionCreators, dispatch),
      thankyouActions: bindActionCreators(thankyouActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(ReportDriver);
