import configureStore from './store';

it('src/ordering/redux/store.js', () => {
  const store = configureStore();
  const state = store.getState();

  expect(state).toEqual({
    router: {
      action: 'POP',
      location: {
        hash: '',
        pathname: '/',
        query: {},
        search: '',
        state: undefined,
      },
    },
    entities: {
      businesses: {},
      categories: {},
      error: {},
      loyaltyHistories: {},
      onlineStores: {},
      orders: {},
      products: {},
      stores: {},
    },
    app: {
      user: {
        isWebview: false,
        consumerId: null,
        country: 'US',
        isLogin: false,
        isExpired: false,
        customerId: '',
        storeCreditsBalance: 0,
        phone: '',
        profile: {
          phone: '',
          name: '',
          email: '',
          birthday: null,
          status: '',
        },
        isError: false,
        otpRequest: {
          data: {
            type: 'otp',
          },
          status: null,
          error: null,
        },
        noWhatsAppAccount: true,
        loginRequestStatus: null,
        loginByBeepAppStatus: null,
      },
      error: null, // network error
      apiError: {
        show: false,
        message: '',
        description: '',
        buttonText: '',
        code: null,
        redirectUrl: '',
      },
      business: null,
      cart: {
        cashback: 0,
        comments: null,
        count: 0,
        discount: 0,
        error: {
          clearCart: null,
          loadCart: null,
          loadCartStatus: null,
          removeCartItemsById: null,
          updateCartItems: null,
        },
        id: null,
        items: [],
        promotions: [],
        receiptNumber: null,
        requestStatus: {
          clearCart: 'fulfilled',
          loadCart: 'fulfilled',
          loadCartStatus: 'fulfilled',
          removeCartItemsById: 'fulfilled',
          updateCartItems: 'fulfilled',
        },
        serviceCharge: 0,
        shippingFee: 0,
        shippingType: '',
        source: 'BeepStore',
        status: null,
        submission: {
          receiptNumber: null,
          requestStatus: {
            loadCartSubmissionStatus: 'fulfilled',
            submitCart: 'fulfilled',
          },
          status: null,
          submissionId: null,
        },
        subtotal: 0,
        tax: 0,
        total: 0,
        unavailableItems: [],
        version: 0,
        voucher: null,
      },
      onlineStoreInfo: {
        id: '',
        status: null,
      },
      coreBusiness: {
        status: null,
      },
      requestInfo: {
        shippingType: '',
        storeId: null,
        tableId: null,
      },
      shoppingCart: {
        billing: {
          applyCashback: false,
          discount: 0,
          promotion: {
            discount: 0,
            promoCode: null,
            promoType: '',
            status: '',
          },
          serviceCharge: 0,
          serviceChargeInfo: {},
          shippingFee: 0,
          subtotal: 0,
          tax: 0,
          total: 0,
          totalCashback: 0,
          voucher: {
            discount: 0,
            promoCode: null,
            promoType: '',
            status: '',
            validFrom: null,
          },
        },
        isFetching: false,
        items: [],
        status: 'pending',
        unavailableItems: [],
      },
      addOrUpdateShoppingCartItemRequest: {
        status: null,
      },
      storeHashCode: {
        data: null,
        status: null,
      },
      onlineCategory: {
        status: null,
      },
      coreStores: {
        status: null,
      },
      productDetail: {
        status: null,
      },
      deliveryDetails: {
        username: '',
        phone: '',
        addressId: '',
        addressName: '',
        deliveryToAddress: '',
        deliveryToLocation: null, // {latitude, longitude}
        addressDetails: '',
        deliveryComments: '',
        deliveryToCity: '',
        postCode: '',
        countryCode: '',
        fetchRequestStatus: null,
      },
    },
    cart: {
      common: {
        cartInventory: {
          error: {},
          status: '',
        },
        pendingTransactionsIds: [],
        reloadBillingByCashbackRequest: {
          error: null,
          status: null,
        },
      },
    },
    customer: {
      customerInfo: {
        customerError: {
          show: false,
          message: '',
          description: '',
          buttonText: '',
        },
        selectAvailableAddress: {
          data: null,
          status: null,
          error: null,
        },
      },
      contactDetail: {
        username: '',
        phone: '',
        updateContactDetailResult: {
          error: null,
          status: null,
        },
      },
      addressDetail: {
        id: '',
        type: '',
        name: '',
        address: '',
        details: '',
        comments: '',
        coords: null,
        city: '',
        postCode: '',
        countryCode: '',
        contactNumber: '',
        contactName: '',
        contactNumberValidStatus: {
          isValid: false,
          isComplete: false,
        },
      },
    },
    payments: {
      common: {
        billing: {
          data: {
            cashback: null,
            itemsQuantity: 0,
            modifiedTime: null,
            receiptNumber: null,
            subtotal: null,
            total: null,
          },
          error: null,
          status: null,
        },
        error: {},
        initPaymentRequest: {
          error: null,
          status: null,
        },
        options: [],
        payByCashPromptDisplay: false,
        selectedOptionProvider: null,
        status: '',
      },
      onlineBanking: {
        selectedOnlineBankingAgentCode: null,
      },
      savedCards: {
        cardList: [],
        loadSavedCardsStatus: false,
        selectedPaymentCard: null,
      },
    },
    promotion: {
      appliedResult: null,
      foundPromo: {},
      hasSearchedForPromo: false,
      inProcess: false,
      isSearchMode: false,
      promoCode: '',
      selectedPromo: {},
      voucherList: {},
    },
    addressList: {
      addressList: {
        data: {},
        error: null,
        status: null,
      },
    },
    locations: {
      listInfo: {
        data: [],
        status: null,
      },
    },
    locationAndDate: {
      currentDate: null, // js Date
      originalDeliveryType: null,
      deliveryType: null,
      storeId: null,
      addressInfo: null,
      selectedDay: null, // js Date
      selectedFromTime: null, // from time, like 09:00
      timeSlotSoldData: [],
      loading: false,
    },
    orderStatus: {
      common: {
        order: null,
        updateShippingTypeStatus: null, // pending || fulfilled || rejected
        updateOrderStatus: null, // pending || fulfilled || rejected
        cancelOrderStatus: null, // pending || fulfilled || rejected
        error: null,
        receiptNumber: null,
        storeReviewInfo: {
          data: {},
          loadDataRequest: {
            status: null,
            error: null,
          },
          saveDataRequest: {
            status: null,
            error: null,
          },
          thankYouModalVisible: false,
          warningModalVisible: false,
          loadingIndicatorVisible: false,
        },
        payLaterOrderInfo: {
          data: {
            orderStatus: null,
            productsManualDiscount: 0,
            receiptNumber: null,
            tableId: null,
            isStorePayByCashOnly: false,
            tax: 0,
            cashback: 0,
            displayPromotions: [],
            loyaltyDiscounts: [],
            appliedVoucher: null,
            total: 0,
            subtotal: 0,
            modifiedTime: null,
            serviceCharge: 0,
            serviceChargeInfo: {},
            shippingFee: 0,
            subOrders: [],
            items: [],
            applyCashback: false,
            redirectUrl: null,
          },
          loadOrderRequest: {
            status: null,
            error: null,
          },
          submitOrderRequest: {
            status: null,
            error: null,
          },
        },
        payLaterOrderStatusInfo: {
          data: {
            tableId: null,
            storeHash: null,
          },
          status: null,
          error: null,
        },
      },
      thankYou: {
        /* included: customerId, consumerId, status */
        cashbackInfo: {
          customerId: null,
          consumerId: null,
          status: null,
          error: null,
        },
        updateCashbackInfoStatus: null,
        storeHashCode: null,
        orderCancellationReasonAsideVisible: false,
        updateShippingTypeStatus: null, // pending || fulfilled || rejected
        updateShippingTypeError: null,
        cancelOrderStatus: null, // pending || fulfilled || rejected
        cancelOrderError: null,
        profileModalVisibility: false,
        foodCourtInfo: {
          hashCode: null,
        },
      },
      reportDriver: {
        inputNotes: '',
        selectedReasonCode: null,
        uploadPhoto: {
          url: '',
          file: null, // File  https://developer.mozilla.org/en-US/docs/Web/API/File
          location: '', // uploaded aws s3 location
        },
        showPageLoader: true,
        submitStatus: 'NOT_SUBMIT',
        inputEmail: {
          value: '',
          isCompleted: false, // it will be completed when input blur
          isValid: false,
        },
      },
      storeReview: { offline: false },
      tableSummary: {
        reloadBillingByCashbackRequest: {
          status: null,
          error: null,
        },

        payByCouponsRequest: {
          status: null,
          error: null,
        },

        redirectLoaderVisible: false,
        processingLoaderVisible: false,
      },
    },
    profile: {
      birthday: '',
      birthdayErrorType: null,
      email: '',
      emailErrorType: null,
      isBirthdayInputFilledStatus: false,
      isEmailInputFilledStatus: false,
      isNameInputFilled: false,
      name: '',
      nameErrorType: null,
      profileUpdatedStatus: null,
    },
    address: {
      addressInfo: {
        data: null,
        error: null,
        status: null,
      },
    },
    menu: {
      common: {
        activeCategoryId: null,
        storeNameInView: true,
        categoriesInView: {},
        currentTime: state.menu.common.currentTime,
        searchingBannerVisible: false,
        searchingProductKeywords: '',
        beforeStartToSearchScrollTopPosition: 0,
        virtualKeyboardVisible: false,
        // User selected expected delivery time: "2022-06-01T01:00:00.000Z" | "now"
        expectedDeliveryTime: null,
        storeFavStatus: {
          data: false,
          status: null,
          error: null,
        },
        storeInfoDrawerVisible: false,
        locationDrawerVisible: false,
        storeListDrawerVisible: false,
        timeSlotDrawerVisible: false,
        locationConfirmModalVisible: false,
        selectedProductItemInfo: null,
      },
      productDetail: {
        isProductDetailDrawerVisible: false,
        selectedProductId: null,
        selectedCategoryId: null,
        selectedQuantity: 1,
        productDetailRequest: {
          status: null,
          error: null,
        },
        addToCartRequest: {
          status: null,
          error: null,
        },
        // TODO: For checking other variation single choice whether unavailable
        // latest selected single choice variation id
        latestSelectedSingleChoiceVariationId: null,
        /**
         * The data structure will be according to Variation Type
         * For Single Choice: [variationId]: { optionId, value }
         * For Simple Multiple Choice: [variationId]: [{optionId, value}]
         * For Quantity Multiple Choice: [variationId]: [{optionId, value, quantity}]
         */
        selectedOptionsByVariationId: {},
        showComments: false,
        comments: '',
      },
      alcohol: {
        alcoholConsent: {
          data: null,
          showModalVisibility: false,
          confirmNotLegal: false,
          status: null,
          error: null,
        },
      },
      cart: { miniCartDrawerVisible: false },
      promotion: {
        promotionDrawerVisible: false,
      },
      address: {
        storeInfo: {
          data: {},
          status: null,
          error: null,
        },
      },
      timeSlot: {
        selectedShippingType: null, // selected shipping type
        selectedDate: null, // selected date, IOS date String format, example: "2022-06-30T16:00:00.000Z"
        selectedTimeSlot: null, // selected time slot, example: "now" || "16:00"
        timeSlotDrawerShownRequest: {
          status: null,
          error: null,
        },
        timeSlotSoldRequest: {
          data: [],
          status: null,
          error: null,
        },
        saveRequest: {
          status: null,
          error: null,
        },
      },
      stores: {
        storeListInfo: {
          status: null,
          error: null,
        },
      },
    },
    promoPayLater: {
      common: {
        appliedResult: {
          success: false,
        },
        error: {
          applyPromo: {},
          removePromo: null,
        },
        removePromoData: {
          code: null,
        },
        requestStatus: {
          applyPromo: 'fulfilled',
          applyVoucherPayLater: 'fulfilled',
          removePromo: 'fulfilled',
          removeVoucherPayLater: 'fulfilled',
        },
      },
    },
    foodCourt: {
      common: {
        foodCourtId: undefined,
        foodCourtStoreList: {
          data: [],
          status: 'pending',
        },
        foodCourtTableId: undefined,
      },
    },
  });
});
