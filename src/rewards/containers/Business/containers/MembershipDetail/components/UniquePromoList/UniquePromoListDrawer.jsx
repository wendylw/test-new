import React from 'react';

const UniquePromoListDrawer = () => {
  return (
    <Drawer
      fullScreen
      className={styles.addressLocationDrawer}
      show={isLocationDrawerVisible}
      header={
        <DrawerHeader
          className={styles.addressLocationDrawerHeader}
          left={
            <X
              weight="light"
              className="tw-flex-shrink-0 tw-text-2xl tw-text-gray"
              onClick={onClose}
              data-test-id="ordering.address-location-drawer.close-btn"
            />
          }
        >
          <span className="tw-font-bold tw-text-lg tw-leading-relaxed">{t('DeliverTo')}</span>
        </DrawerHeader>
      }
      onShown={onHandleShownDrawer}
      onClose={onHandleCloseDrawer}
    >
      {children}
    </Drawer>
  );
};

UniquePromoListDrawer.displayName = 'UniquePromoListDrawer';

export default UniquePromoListDrawer;
