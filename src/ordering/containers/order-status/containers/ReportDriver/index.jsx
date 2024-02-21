import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import qs from 'qs';
import _get from 'lodash/get';
import { connect } from 'react-redux';
import { compose } from 'redux';
import prefetch from '../../../../../common/utils/prefetch-assets';
import Constants from '../../../../../utils/constants';
import PageLoader from '../../../../../components/PageLoader';
import feedBackThankyou from '../../../../../images/feedback-thankyou.png';
import { IconInsertPhoto, IconClose } from '../../../../../components/Icons';
import HybridHeader from '../../../../../components/HybridHeader';
import Radio from '../../../../../components/Radio';
import { actions as reportDriverActionCreators } from './redux';
import { fetchReport as fetchReportThunk, submitReport as submitReportThunk } from './redux/thunks';
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
import { loadOrder as loadOrderThunk } from '../../redux/thunks';
import { getReceiptNumber } from '../../redux/selector';
import {
  actions as appActionCreators,
  getUserEmail,
  getUserConsumerId,
  getUser,
  getUserIsLogin,
  getIsAlipayMiniProgram,
} from '../../../../redux/modules/app';
import './OrderingReportDriver.scss';
import Utils from '../../../../../utils/utils';
import * as NativeMethods from '../../../../../utils/native-methods';
import { alert } from '../../../../../common/feedback';
import logger from '../../../../../utils/monitoring/logger';

const NOTE_MAX_LENGTH = 140;
const UPLOAD_FILE_MAX_SIZE = 10 * 1024 * 1024; // 10M
const { REPORT_DRIVER_REASON_CODE } = Constants;

class ReportDriver extends Component {
  inputRefOfEmail = null;

  componentDidMount = async () => {
    const {
      receiptNumber,
      loadOrder,
      fetchReport,
      userIsLogin,
      loginByAlipayMiniProgram,
      isAlipayMiniProgram,
    } = this.props;

    await loadOrder(receiptNumber);

    if (!userIsLogin) {
      if (Utils.isWebview()) {
        const tokens = await NativeMethods.getTokenAsync();
        await this.loginAppWithNativeToken(tokens);

        const { user } = this.props;
        if (!user.isLogin && user.isExpired) {
          const refreshedTokens = await NativeMethods.tokenExpiredAsync();
          await this.loginAppWithNativeToken(refreshedTokens);
        }
      }

      if (isAlipayMiniProgram) {
        await loginByAlipayMiniProgram();
      }
    }

    this.preFillEmail();

    fetchReport();
    prefetch(['ORD_TY', 'ORD_PL'], ['OrderingThankYou']);
  };

  componentWillUnmount = () => {
    const { removeUploadPhotoFile } = this.props;

    // release the file reference
    removeUploadPhotoFile();
  };

  loginAppWithNativeToken = async result => {
    const { loginApp } = this.props;
    const accessToken = _get(result, 'access_token', null);
    const refreshToken = _get(result, 'refresh_token', null);

    if (!accessToken || !refreshToken) {
      logger.error('Ordering_ReportDriver_LoginByBeepAppFailedByInvalidNativeToken');
      return;
    }
    await loginApp({
      accessToken,
      refreshToken,
    });
  };

  preFillEmail = async () => {
    const { userConsumerId, loadProfileInfo } = this.props;

    userConsumerId && (await loadProfileInfo(userConsumerId));

    const { userEmail, initialEmail } = this.props;

    initialEmail(userEmail);
  };

  handleGoBack = () => {
    this.goBack();
  };

  handleDone = () => {
    this.goBack();
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
    const { updateInputNotes } = this.props;
    const notes = e.target.value.slice(0, NOTE_MAX_LENGTH);

    updateInputNotes(notes);
  };

  handleNotesBlur = () => {
    const { inputNotes, updateInputNotes } = this.props;

    updateInputNotes(inputNotes.trim());
  };

  handleEmailChange = e => {
    const { updateInputEmail } = this.props;
    const email = e.target.value;

    updateInputEmail(email);
  };

  handleEmailInputBlur = () => {
    const { inputEmailCompleted } = this.props;

    inputEmailCompleted();
  };

  handleUploadPhoto = e => {
    const { t, setUploadPhotoFile } = this.props;
    // File Object https://developer.mozilla.org/en-US/docs/Web/API/File
    const file = e.target.files[0];

    if (file.size > UPLOAD_FILE_MAX_SIZE) {
      alert.raw(
        <p className="padding-small text-size-biggest text-weight-bolder">
          {t('UploadPhotoTooLarge', { maxFileSize: UPLOAD_FILE_MAX_SIZE / (1024 * 1024) })}
        </p>
      );

      // clear the select file
      e.target.value = '';
      return;
    }

    setUploadPhotoFile(file);
  };

  handleRemoveUploadPhoto = () => {
    const { removeUploadPhotoFile } = this.props;

    removeUploadPhotoFile();
  };

  validate = () => {
    const { inputEmailCompleted } = this.props;

    inputEmailCompleted();

    const { inputEmailIsValid } = this.props;

    if (!inputEmailIsValid) {
      this.inputRefOfEmail?.focus();
      return false;
    }

    const { submittable } = this.props;

    if (!submittable) {
      return false;
    }

    return true;
  };

  handleSubmit = async () => {
    if (!this.validate()) {
      return;
    }

    const { submitReport } = this.props;

    await submitReport();
  };

  handleSelectReason = reasonCode => {
    const { selectReasonCode } = this.props;

    selectReasonCode(reasonCode);
  };

  goBack = () => {
    if (Utils.isWebview()) {
      NativeMethods.goBack();
      return;
    }

    const from = Utils.getQueryString('from');
    const { history } = this.props;

    if (from === 'orderDetails') {
      history.goBack();
      return;
    }

    // from sms
    this.gotoThankYourPage();
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
        <HybridHeader
          className="flex-middle"
          contentClassName="flex-middle"
          data-test-id="ordering.report-driver.thank-you-header"
          isPage
          title={t('ReportIssue')}
          navFunc={this.handleGoBack}
        />
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
            data-test-id="ordering.order-status.report-driver.done-btn"
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
            data-test-id="ordering.report-driver.notes-input"
            placeholder={disabled ? '' : t('NoteFieldPlaceholder')}
            rows="5"
            maxLength={NOTE_MAX_LENGTH}
            value={inputNotes}
            onChange={this.handleNotesChange}
            onBlur={this.handleNotesBlur}
            disabled={disabled}
          />
          <p className="text-size-small text-right padding-small text-opacity">
            {t('LimitCharacters', { inputLength: inputNotes.length, maxLength: NOTE_MAX_LENGTH })}
          </p>
        </div>
      </div>
    );
  }

  renderEmailField({ t, inputEmail, disabled }) {
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
            ref={ref => {
              this.inputRefOfEmail = ref;
            }}
            disabled={disabled}
            value={value}
            onChange={this.handleEmailChange}
            onBlur={this.handleEmailInputBlur}
            className="ordering-report-driver__input-email form__input padding-small form__group"
            data-test-id="ordering.order-status.report-driver.email-input"
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
                data-test-id="ordering.report-driver.remove-image"
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
              data-test-id="ordering.report-driver.add-image"
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
      <section className="ordering-report-driver flex flex-column" data-test-id="ordering.report-driver.container">
        <HybridHeader
          className="flex-middle"
          contentClassName="flex-middle"
          data-test-id="ordering.report-driver.header"
          isPage
          title={t('ReportIssue')}
          navFunc={this.handleGoBack}
        />

        <div className="ordering-report-driver__container padding-top-bottom-small">
          <div className="card padding-small margin-normal">
            {this.renderEmailField({
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
                .map(({ code, label }) => (
                  <li key={code} className="flex flex-top padding-top-bottom-small">
                    <Radio
                      onChange={() => {
                        this.handleSelectReason(code);
                      }}
                      data-test-id="ordering.report-driver.reason-item"
                      checked={selectedReasonCode === code}
                      inputId={`reason_${code}`}
                      name="reason"
                      disabled={disabled}
                    />
                    <label className="padding-left-right-small margin-smaller" htmlFor={`reason_${code}`}>
                      {label}
                    </label>
                  </li>
                ))}
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
                data-test-id="ordering.report-driver.submit-btn"
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

ReportDriver.displayName = 'ReportDriver';

ReportDriver.propTypes = {
  user: PropTypes.shape({
    isLogin: PropTypes.bool,
    isExpired: PropTypes.bool,
  }),
  inputEmail: PropTypes.shape({
    value: PropTypes.string,
    isCompleted: PropTypes.bool,
    isValid: PropTypes.bool,
  }),
  submittable: PropTypes.bool,
  userIsLogin: PropTypes.bool,
  isAlipayMiniProgram: PropTypes.bool,
  showPageLoader: PropTypes.bool,
  inputEmailIsValid: PropTypes.bool,
  isSubmitButtonDisabled: PropTypes.bool,
  userEmail: PropTypes.string,
  inputNotes: PropTypes.string,
  submitStatus: PropTypes.string,
  receiptNumber: PropTypes.string,
  userConsumerId: PropTypes.string,
  uploadPhotoUrl: PropTypes.string,
  selectedReasonCode: PropTypes.string,
  /* eslint-disable react/forbid-prop-types */
  uploadPhotoFile: PropTypes.object,
  selectedReasonNoteField: PropTypes.object,
  selectedReasonPhotoField: PropTypes.object,
  /* eslint-enable */
  loginApp: PropTypes.func,
  loadOrder: PropTypes.func,
  fetchReport: PropTypes.func,
  submitReport: PropTypes.func,
  initialEmail: PropTypes.func,
  loadProfileInfo: PropTypes.func,
  selectReasonCode: PropTypes.func,
  updateInputNotes: PropTypes.func,
  updateInputEmail: PropTypes.func,
  setUploadPhotoFile: PropTypes.func,
  inputEmailCompleted: PropTypes.func,
  loginByAlipayMiniProgram: PropTypes.func,
  removeUploadPhotoFile: PropTypes.func,
};

ReportDriver.defaultProps = {
  user: {
    isLogin: false,
    isExpired: false,
  },
  inputEmail: {
    value: '',
    isCompleted: false,
    isValid: false,
  },
  submittable: false,
  userIsLogin: false,
  isAlipayMiniProgram: false,
  showPageLoader: false,
  inputEmailIsValid: false,
  isSubmitButtonDisabled: false,
  userEmail: '',
  inputNotes: '',
  submitStatus: SUBMIT_STATUS.NOT_SUBMIT,
  receiptNumber: null,
  userConsumerId: null,
  uploadPhotoUrl: '',
  uploadPhotoFile: null,
  selectedReasonCode: null,
  selectedReasonNoteField: null,
  selectedReasonPhotoField: null,
  loginApp: () => {},
  loadOrder: () => {},
  fetchReport: () => {},
  submitReport: () => {},
  initialEmail: () => {},
  loadProfileInfo: () => {},
  selectReasonCode: () => {},
  updateInputNotes: () => {},
  updateInputEmail: () => {},
  setUploadPhotoFile: () => {},
  inputEmailCompleted: () => {},
  loginByAlipayMiniProgram: () => {},
  removeUploadPhotoFile: () => {},
};

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
      user: getUser(state),
      isAlipayMiniProgram: getIsAlipayMiniProgram(state),
      userIsLogin: getUserIsLogin(state),
    }),
    {
      updateInputNotes: reportDriverActionCreators.updateInputNotes,
      setUploadPhotoFile: reportDriverActionCreators.setUploadPhotoFile,
      removeUploadPhotoFile: reportDriverActionCreators.removeUploadPhotoFile,
      setUploadPhotoFileLocation: reportDriverActionCreators.setUploadPhotoFileLocation,
      selectReasonCode: reportDriverActionCreators.selectReasonCode,
      updateSubmitStatus: reportDriverActionCreators.updateSubmitStatus,
      fetchReport: fetchReportThunk,
      submitReport: submitReportThunk,
      loadOrder: loadOrderThunk,
      updateInputEmail: reportDriverActionCreators.updateInputEmail,
      inputEmailCompleted: reportDriverActionCreators.inputEmailCompleted,
      initialEmail: reportDriverActionCreators.initialEmail,
      loadProfileInfo: appActionCreators.loadProfileInfo,
      loginApp: appActionCreators.loginApp,
      loginByAlipayMiniProgram: appActionCreators.loginByAlipayMiniProgram,
    }
  )
)(ReportDriver);
