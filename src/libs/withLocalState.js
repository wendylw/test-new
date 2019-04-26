import { graphql } from 'react-apollo';
import apiGql from '../apiGql';

export default graphql(apiGql.GET_LOCAL_STATE, { name: 'localState' });
