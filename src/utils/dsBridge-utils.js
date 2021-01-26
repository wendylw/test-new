import dsbridge from 'dsbridge';

export const updateNativeHeader = ({ left, middle, right }) => {
  dsBridge.call('updateNativeHeader', {});

  dsBridge.register('click', function() {
    return 'click';
  });
};
