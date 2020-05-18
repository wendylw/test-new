import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import { connect } from 'react-redux';
import { compose } from 'redux';

import Header from '../../../components/Header';

const NOTE_MAX_LENGTH = 140;

class ReportBadDriver extends Component {
  componentDidMount() {}

  handleGoBack = () => {};

  render() {
    const { t } = this.props;
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
            ></textarea>
            <div className="report-bad-driver__note-char-length">
              {t('LimitCharacters', { inputLength: 0, maxLength: NOTE_MAX_LENGTH })}
            </div>
          </div>
          <div className="report-bad-driver__common-issues">
            <h3 className="report-bad-driver__common-issues-title">{t('CommonIssues')}</h3>
            <ul className="report-bad-driver__common-issues-list">
              <li className="report-bad-driver__common-issues-list-item">
                <button className="report-bad-driver__common-issues-button">Food was damaged</button>
              </li>
              <li className="report-bad-driver__common-issues-list-item">
                <button className="report-bad-driver__common-issues-button">Driver was late</button>
              </li>
              <li className="report-bad-driver__common-issues-list-item">
                <button className="report-bad-driver__common-issues-button">
                  Driver asked for more money on delivery
                </button>
              </li>
              <li className="report-bad-driver__common-issues-list-item">
                <button className="report-bad-driver__common-issues-button">Driver was rude</button>
              </li>
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
    state => ({}),
    dispatch => ({})
  )
)(ReportBadDriver);
