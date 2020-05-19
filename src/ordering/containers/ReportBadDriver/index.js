import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';

import Header from '../../../components/Header';
import {
  actions as reportBadDriverActionCreators,
  getCommonIssuesCodes,
  getInputNotes,
  getSelectedCommonIssues,
  getIsUseStorehubLogistics,
  getOrderStatus,
} from '../../redux/modules/reportBadDriver';
const NOTE_MAX_LENGTH = 140;

class ReportBadDriver extends Component {
  componentDidMount() {
    // this.props.reportBadDriverActions.loadOrder();
  }

  handleGoBack = () => {};

  handleNotesChange = e => {
    const notes = e.target.value;
    this.props.reportBadDriverActions.updateInputNodes(notes);
  };

  handleCommonIssuesClick = e => {};

  toggleCommonIssue = CommonIssueCode => {
    const { reportBadDriverActions, selectedCommonIssues } = this.props;
    if (selectedCommonIssues.has(CommonIssueCode)) {
      reportBadDriverActions.removeSelectedCommonIssues(CommonIssueCode);
    } else {
      reportBadDriverActions.addSelectedCommonIssues(CommonIssueCode);
    }
  };

  render() {
    const { t, inputNotes, selectedCommonIssues, commonIssuesCodes } = this.props;
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
              placeholder={t('NoteFieldPlaceholder')}
              rows="5"
              maxLength={NOTE_MAX_LENGTH}
              value={inputNotes}
              onChange={this.handleNotesChange}
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
              <button className="report-bad-driver__submit-button">{t('Submit')}</button>
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
    }),
    dispatch => ({
      reportBadDriverActions: bindActionCreators(reportBadDriverActionCreators, dispatch),
    })
  )
)(ReportBadDriver);
