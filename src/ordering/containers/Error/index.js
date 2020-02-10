import ErrorPage from '../../../components/ErrorPage';

import { connect } from 'react-redux';
import { getError } from '../../redux/modules/entities/error';

import '../Common.scss';
import '../App.scss';

export class NotFound extends Component {
  render() {
    const { error } = this.props;

    return <ErrorPage error={error} />;
  }
}

export default connect(
  state => ({
    error: getError(state),
  }),
  dispatch => ({})
)(NotFound);
