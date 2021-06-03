import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { connect } from 'react-redux';
import { compose } from 'redux';

import Constants from '../../../../../utils/constants';
import PageLoader from '../../../../../components/PageLoader';
import feedBackThankyou from '../../../../../images/feedback-thankyou.png';
import { IconInsertPhoto } from '../../../../../components/Icons';
import Header from '../../../../../components/Header';
import Radio from '../../../../../components/Radio';
import { actions as reportDriverActionCreators, thunks as reportDriverThunks } from './redux';
import {
  getInputNotes,
  getSelectedReasonCode,
  getSubmitStatus,
  getShowPageLoader,
  getUploadPhotoUrl,
  getUploadPhotoFile,
  getInputEmail,
  getSelectedReasonNoteField,
  getSelectedReasonPhotoField,
  getSubmittable,
  getIsSubmitButtonDisabled,
  getInputEmailIsValid,
} from './redux/selectors';
import { SUBMIT_STATUS, REPORT_DRIVER_REASONS } from './constants';
import { actions as commonActionCreators, getReceiptNumber } from '../../redux/common';
import { actions as appActionCreators, getUserEmail, getUserConsumerId } from '../../../../redux/modules/app';
import { IconClose } from '../../../../../components/Icons';
import './OrderingReportDriver.scss';

const NOTE_MAX_LENGTH = 140;
const UPLOAD_FILE_MAX_SIZE = 10 * 1024 * 1024; // 10M
const { REPORT_DRIVER_REASON_CODE } = Constants;

class ReportDriver extends Component {
  inputRefOfEmail = null;

  componentDidMount = async () => {
    const { receiptNumber, loadOrder, fetchReport, userConsumerId, getProfileInfo, initialEmail } = this.props;

    await loadOrder(receiptNumber);

    userConsumerId && (await getProfileInfo(userConsumerId));

    initialEmail(this.props.userEmail);

    fetchReport();
  };

  componentWillUnmount() {
    // release the file reference
    this.props.removeUploadPhotoFile();
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
    const notes = e.target.value.slice(0, NOTE_MAX_LENGTH);

    this.props.updateInputNotes(notes);
  };

  handleNotesBlur = () => {
    const { inputNotes } = this.props;

    this.props.updateInputNotes(inputNotes.trim());
  };

  handleEmailChange = e => {
    const email = e.target.value;

    this.props.updateInputEmail(email);
  };

  handleEmailInputBlur = () => {
    this.props.inputEmailCompleted();
  };

  handleUploadPhoto = e => {
    // File Object https://developer.mozilla.org/en-US/docs/Web/API/File
    const file = e.target.files[0];

    if (file.size > UPLOAD_FILE_MAX_SIZE) {
      this.props.showMessageModal({
        message: this.props.t('UploadPhotoTooLarge', { maxFileSize: UPLOAD_FILE_MAX_SIZE / (1024 * 1024) }),
      });
      // clear the select file
      e.target.value = '';
      return;
    }

    this.props.setUploadPhotoFile(file);
  };

  handleRemoveUploadPhoto = () => {
    this.props.removeUploadPhotoFile();
  };

  validate = () => {
    this.props.inputEmailCompleted();

    if (!this.props.inputEmailIsValid) {
      this.inputRefOfEmail?.focus();
      return false;
    }

    if (!this.props.submittable) {
      return false;
    }

    return true;
  };

  handleSubmit = async () => {
    if (!this.validate()) {
      return;
    }

    await this.props.submitReport();
  };

  handleSelectReason = reasonCode => {
    this.props.selectReasonCode(reasonCode);
  };

  renderSubmitButtonContent = () => {
    const { t, submitStatus } = this.props;
    switch (submitStatus) {
      case SUBMIT_STATUS.NOT_SUBMIT:
        return t('Submit');
      case SUBMIT_STATUS.IN_PROGRESS:
        return t('Processing');
      case SUBMIT_STATUS.SUBMITTED:
        return t('Submitted');
      default:
        return t('Submit');
    }
  };

  renderThankYou() {
    const { t } = this.props;
    return (
      <section className="ordering-report-thanks">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          data-heap-name="ordering.report-driver.thank-you-header"
          isPage={false}
          title={t('ReportIssue')}
          navFunc={this.handleGoBack}
        ></Header>
        <div className="padding-normal">
          <div className="text-center padding-left-right-normal">
            <img className="ordering-report-thanks__image" alt="Thank your feedback" src={feedBackThankyou} />
          </div>
          <h2 className="ordering-report-thanks__page-title text-center text-size-large text-weight-light">
            {t('ThankYou')}!
          </h2>
          <p className="ordering-report-thanks__page-description padding-small margin-top-bottom-small text-center text-size-big">
            {t('ThankyouYourFeedbackContent')}
          </p>
          <button
            className="button button__fill button__block margin-top-bottom-small text-weight-bolder text-uppercase"
            onClick={this.handleDone}
          >
            {t('Done')}
          </button>
        </div>
      </section>
    );
  }

  renderNotesField({ t, inputNotes, disabled, required }) {
    return (
      <div className="padding-top-bottom-small margin-top-bottom-small">
        <h3 className="margin-small">
          <span className="text-weight-bolder">{t('Notes')}</span>
          {required ? <span className="text-error text-lowercase">{` - *${t('Common:Required')}`}</span> : null}
        </h3>
        <div className="ordering-report-driver__group form__group margin-left-right-small border-radius-normal">
          <textarea
            className="ordering-report-driver__textarea form__textarea padding-small"
            data-heap-name="ordering.report-driver.notes-input"
            placeholder={disabled ? '' : t('NoteFieldPlaceholder')}
            rows="5"
            maxLength={NOTE_MAX_LENGTH}
            value={inputNotes}
            onChange={this.handleNotesChange}
            onBlur={this.handleNotesBlur}
            disabled={disabled}
          ></textarea>
          <p className="text-size-small text-right padding-small text-opacity">
            {t('LimitCharacters', { inputLength: inputNotes.length, maxLength: NOTE_MAX_LENGTH })}
          </p>
        </div>
      </div>
    );
  }

  renderEmailFiled({ t, inputEmail, disabled }) {
    const { value, isCompleted, isValid } = inputEmail;

    const showInvalidError = isCompleted && !isValid;

    return (
      <div className="padding-top-bottom-small">
        <h3 className="margin-small">
          <span className="text-weight-bolder">{t('Email')}</span>
          <span className="text-error text-lowercase">{` - *${t('Common:Required')}`}</span>
        </h3>
        <div
          className={`ordering-report-driver__group ${
            showInvalidError ? 'error' : ''
          } form__group margin-left-right-small border-radius-normal`}
        >
          <input
            ref={ref => (this.inputRefOfEmail = ref)}
            disabled={disabled}
            value={value}
            onChange={this.handleEmailChange}
            onBlur={this.handleEmailInputBlur}
            className="ordering-report-driver__input-email form__input padding-small form__group"
          />
        </div>
        {showInvalidError && (
          <p className="form__error-message padding-left-right-normal margin-top-bottom-small">
            {t('PleaseEnterValidEmail')}
          </p>
        )}
      </div>
    );
  }

  renderPhotoField({ t, uploadPhotoFile, uploadPhotoUrl, disabled, required }) {
    return (
      <div className="padding-top-bottom-small margin-top-bottom-small">
        <h3 className="margin-small">
          <span className="text-weight-bolder">{t('UploadPhoto')}</span>
          {required ? <span className="text-error text-lowercase">{` - *${t('Common:Required')}`}</span> : null}
        </h3>
        {uploadPhotoFile ? (
          <div className="ordering-report-driver__upload-image-container margin-small border-radius-large">
            <img className="ordering-report-driver__upload-image" alt="upload file" src={uploadPhotoUrl} />
            {disabled ? null : (
              <button
                onClick={this.handleRemoveUploadPhoto}
                className="ordering-report-driver__button-close button flex flex-middle flex-center margin-smaller"
                data-heap-name="ordering.report-driver.remove-image"
              >
                <IconClose className="ordering-report-driver__icon-close icon icon__smaller" />
              </button>
            )}
          </div>
        ) : (
          <div className="ordering-report-driver__upload-container text-center margin-small">
            <input
              className="ordering-report-driver__input"
              onChange={this.handleUploadPhoto}
              type="file"
              accept="image/*"
              data-heap-name="ordering.report-driver.add-image"
            />
            <div className="ordering-report-driver__upload padding-normal border-radius-large">
              <IconInsertPhoto className="icon icon__normal" />
              <p className="ordering-report-driver__upload-text margin-small text-size-small">{t('UploadFileHere')}</p>
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
      uploadPhotoFile,
      uploadPhotoUrl,
      inputEmail,
      selectedReasonNoteField,
      selectedReasonPhotoField,
      isSubmitButtonDisabled,
    } = this.props;
    const disabled = submitStatus !== SUBMIT_STATUS.NOT_SUBMIT;

    if (showPageLoader) {
      return <PageLoader />;
    }

    if (submitStatus === SUBMIT_STATUS.SUBMITTED) {
      return this.renderThankYou();
    }

    return (
      <section className="ordering-report-driver flex flex-column" data-heap-name="ordering.report-driver.container">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          data-heap-name="ordering.report-driver.header"
          isPage={false}
          title={t('ReportIssue')}
          navFunc={this.handleGoBack}
        ></Header>

        <div className="ordering-report-driver__container padding-top-bottom-small">
          <div className="card padding-small margin-normal">
            {this.renderEmailFiled({
              t,
              disabled,
              inputEmail,
            })}
            <h3 className="margin-small text-weight-bolder">{t('SelectAReportReason')}</h3>
            <ul className="margin-small">
              {REPORT_DRIVER_REASONS.map(reason => ({
                ...reason,
                label: t(reason.i18n_key),
              }))
                // sort by localeCompare of reason.label, for English is alphabetic ascendings
                .sort((reason1, reason2) => {
                  // put the others of reason at the end
                  if (reason1.code === REPORT_DRIVER_REASON_CODE.OTHERS) return 1;
                  if (reason2.code === REPORT_DRIVER_REASON_CODE.OTHERS) return -1;

                  return reason1.label.localeCompare(reason2.label);
                })
                .map(({ code, label }) => {
                  return (
                    <li key={code} className="flex flex-top padding-top-bottom-small">
                      <Radio
                        onChange={() => {
                          this.handleSelectReason(code);
                        }}
                        data-heap-name="ordering.report-driver.reason-item"
                        data-heap-reason={code}
                        checked={selectedReasonCode === code}
                        inputId={`reason_${code}`}
                        name="reason"
                        disabled={disabled}
                      />
                      <label className="padding-left-right-small margin-smaller" htmlFor={`reason_${code}`}>
                        {label}
                      </label>
                    </li>
                  );
                })}
            </ul>
            {selectedReasonNoteField
              ? this.renderNotesField({ t, inputNotes, disabled, required: selectedReasonNoteField.required })
              : null}

            {selectedReasonPhotoField
              ? this.renderPhotoField({
                  t,
                  uploadPhotoFile,
                  uploadPhotoUrl,
                  disabled,
                  required: selectedReasonPhotoField.required,
                })
              : null}
            <div className="margin-small">
              <button
                className="button button__block button__fill text-uppercase text-weight-bolder"
                data-heap-name="ordering.report-driver.submit-btn"
                disabled={isSubmitButtonDisabled}
                onClick={this.handleSubmit}
              >
                {this.renderSubmitButtonContent()}
              </button>
            </div>
          </div>
        </div>
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
      receiptNumber: getReceiptNumber(state),
      submitStatus: getSubmitStatus(state),
      showPageLoader: getShowPageLoader(state),
      uploadPhotoFile: getUploadPhotoFile(state),
      uploadPhotoUrl: getUploadPhotoUrl(state),
      inputEmail: getInputEmail(state),
      userEmail: getUserEmail(state),
      userConsumerId: getUserConsumerId(state),
      selectedReasonNoteField: getSelectedReasonNoteField(state),
      selectedReasonPhotoField: getSelectedReasonPhotoField(state),
      submittable: getSubmittable(state),
      isSubmitButtonDisabled: getIsSubmitButtonDisabled(state),
      inputEmailIsValid: getInputEmailIsValid(state),
    }),
    {
      updateInputNotes: reportDriverActionCreators.updateInputNotes,
      setUploadPhotoFile: reportDriverActionCreators.setUploadPhotoFile,
      removeUploadPhotoFile: reportDriverActionCreators.removeUploadPhotoFile,
      setUploadPhotoFileLocation: reportDriverActionCreators.setUploadPhotoFileLocation,
      selectReasonCode: reportDriverActionCreators.selectReasonCode,
      updateSubmitStatus: reportDriverActionCreators.updateSubmitStatus,
      fetchReport: reportDriverThunks.fetchReport,
      submitReport: reportDriverThunks.submitReport,
      loadOrder: commonActionCreators.loadOrder,
      showMessageModal: appActionCreators.showMessageModal,
      updateInputEmail: reportDriverActionCreators.updateInputEmail,
      inputEmailCompleted: reportDriverActionCreators.inputEmailCompleted,
      initialEmail: reportDriverActionCreators.initialEmail,
      getProfileInfo: appActionCreators.getProfileInfo,
    }
  )
)(ReportDriver);
