import dsBridge from 'dsbridge';

export const updateNativeHeader = () => {
  console.log('updateNativeHeader');
  dsBridge.call('updateNativeHeader', {});

  dsBridge.register('click', function() {
    return 'click';
  });
};
