import { useDispatch, useSelector } from 'react-redux';
import { useUpdateEffect } from 'react-use';
import { actions as customerActions } from '../redux/modules/customer';
import { getCustomerLoadable } from '../redux/modules/customer/selectors';
import { loadConsumerCustomerInfo } from '../redux/modules/customer/thunks';

const useFetchCustomerInfo = () => {
  const dispatch = useDispatch();
  const loadable = useSelector(getCustomerLoadable);

  useUpdateEffect(() => {
    if (loadable) {
      dispatch(loadConsumerCustomerInfo());
    }

    return () => {
      dispatch(customerActions.consumerCustomerInfoReset());
    };
  }, [loadable]);
};

export default useFetchCustomerInfo;
