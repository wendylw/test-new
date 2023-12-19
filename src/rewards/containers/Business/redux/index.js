import { combineReducers } from 'redux';
import membershipForm from '../containers/MembershipForm/redux';
import membershipDetail from '../containers/MembershipDetail/redux';

export default combineReducers({
  membershipForm,
  membershipDetail,
});
