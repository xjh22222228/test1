// APP打開頁面來源
const FROM_SOURCE = {
  // APP訂單詳情推送
  orderInfoPushNotification: 1
};

export const getNavBackPath = (fromSource) => {
  let path = '';
  switch (Number(fromSource)) {
    case FROM_SOURCE.orderInfoPushNotification:
      path = '/market/orderList';
      break;
    default:
  }
  return path;
};
