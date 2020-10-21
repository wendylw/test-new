import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';
import './Profile.scss';
import 'react-datepicker/dist/react-datepicker.css';
import { IconKeyArrowDown } from '../../../components/Icons';

class Profile extends Component {
  state = {
    date: '12',
    month: '06',
  };

  handleClickBack = () => {
    const newSearchParams = Utils.addParamToSearch('pageRefer', 'cart');
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
      // search: window.location.search,
      search: newSearchParams,
    });
  };

  render() {
    const { t } = this.props;
    const { month, date } = this.state;
    return (
      <div>
        <Header
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          isPage={true}
          title={t('CompleteYourProfile')}
          navFunc={this.handleClickBack.bind(this)}
        />
        <section className="profile__container padding-left-right-normal">
          <p className="margin-top-bottom-normal text-size-big text-line-height-base">{t('CompleteProfileTip')}</p>
          <div>
            <form>
              <div className="profile__input padding-small border-radius-base">
                <div>Name</div>
                <input className="form__input" type="text" required={true} />
              </div>
              <div className="profile__input padding-small border-radius-base">
                <div>Email Address</div>
                <input className="form__input" type="text" />
              </div>
              <div className="profile__input padding-small border-radius-base">
                <div>Date of Birth</div>
                <div className="flex flex-space-between">
                  <div>
                    {month}/{date}
                  </div>
                  <div>
                    <label for="birthday">
                      <IconKeyArrowDown />
                      <DatePicker />
                    </label>

                    {/*<DatePicker className="form__input" onChange={this.handleDateChange}>*/}
                    {/*  <IconKeyArrowDown />*/}
                    {/*</DatePicker>*/}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>
    );
  }
}

export default withTranslation()(Profile);
