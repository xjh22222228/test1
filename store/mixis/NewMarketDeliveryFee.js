import utils from "@utils";
import _ from "lodash";
function defaultPlan() {
  return {
    // 基礎配送費
    shippingPrice: 0,
    // 超重
    overWeightCost: 0,
    // 生鮮费用
    freshCost: 0,
    // 配送費應急加價
    shippingPriceIncrement: 0,
    // 門檻  當前方案 則為此時購物車的價格
    limitPrice: 0,
    // 原來的配送費總價
    originalPrice: 0,
    //  utils.filterSecret(this.shippingPrice + this.overWeightCost + this.shippingPriceIncrement + this.freshCost)
    // 抵扣完減免活動后的真實的預估配送費   根據此字段比較
    realShippingPrice: 0,
    // utils.filterSecret(this.leftShippingPrice + this.leftShippingPriceIncrement + this.freshCost + this.leftOverWeightCost);

    // 商家減免的配送費
    merchantFreeShippingPrice: 0,
    // 商家減免的超重配送费
    merchantFreeOverWeightPrice: 0,
    // 商家減免的應急加價
    merchantFreeIncrementPrice: 0,

    // 平臺減免的配送費
    deliveryFreeShippingPrice: 0,
    // 平臺減免的超重配送费
    deliveryFreeOverWeightPrice: 0,
    // 平臺減免的應急加價
    deliveryFreeIncrementPrice: 0
  };
};

class NewMarketDeliveryFee {
  constructor(param) {
    // 門店信息
    this.marketStoreDetail = param.marketStoreDetail;
    // 門店選中的信息
    this.marketOrderOther = param.marketOrderOther;
    // 购物车的实际价格
    this.marketCartPriceTotal = param.marketCartPriceTotal;

    // 是否有生鮮
    this.haveFresh = param.haveFresh;
    // 總重量
    this.totalWeight = utils.filterSecret(param.totalWeight);
    // 起送價加價
    this.incrementAmount = this.getIncrementAmount();
    // 緊急加價
    this.shippingPriceIncrement = this.getAddPrice();

    // 获取配送类型
    const deliveryType = this.getDeliveryType();
    // 平臺與商家共享
    this.isMerchantShare = param?.marketStoreDelivery?.isMerchantShare || false;

    //  ===========優惠 start==========
    // 商家滿減優惠
    this.marketMerchantDeliveryFreeInfo = param.marketMerchantDeliveryFreeInfo;
    // 平臺滿減優惠   自送不享受平臺減免
    this.marketStoreDelivery = deliveryType == 2 ? "" : (param.marketStoreDelivery);

    // 平臺參與應急加價減免
    this.deliveryIsContainAddAmtn = param?.marketStoreDelivery?.isContainAddAmtn || false;
    // **平台参与超重减免
    this.deliveryIsContainOverWeightAmtn = param?.marketStoreDelivery?.isContainOverWeightAmtn || false;
    // 平臺與商家共享
    this.isMerchantShare = param?.marketStoreDelivery?.isMerchantShare || false;
    // 商家參與應急加價減免
    this.merchantIsContainAddAmtn = param?.marketMerchantDeliveryFreeInfo?.isContainAddAmtn || false;
    // **商家参与超重减免
    this.merchantIsContainOverWeightAmtn = param?.marketMerchantDeliveryFreeInfo?.isContainOverWeightAmtn || false;
    //  ===========優惠 end ==========

    // 超重不能送
    this.overWeightCannotSend = false;
    // 超出基礎配送費的重量
    this.overBaseWeight = 0;
    // 超出上限重量
    this.overLimitWeight = 0;

    this.currentPlan = defaultPlan();

    this.nextPlan = '';
    this.cart();
  }

  cart() {
    const planList = this.getPlanList();
    const totalWeight = this.totalWeight;
    if (this.marketCartPriceTotal === 0) {
      // 取起送價最小的方案
      const minPlan = _.minBy(planList, 'amount');
      // 如果有相同起送价的
      const minPlanList = planList.filter(item => minPlan.amount);
      // 計算所有方案的實際配送費
      const resultPlanList = minPlanList.map(item => this.getDefaultPlan(item));
      // 已經計算減免
      const tempPlan = _.minBy(resultPlanList, 'realCost') || this.getDefaultPlan();
      this.currentPlan = tempPlan;
      // 起送價含 起送加價
      this.sendPrice = utils.filterSecret(this.currentPlan.sendPrice);
      this.getNextPlan(resultPlanList, this.sendPrice);
      return;
    }
    const res = [];
    for (const plan of planList) {
      // 獲取生效的方案
      const tempCost = this.getActiveCostPlan(totalWeight, plan); // 超重或者 超重沒有分單
      if (tempCost) {
        res.push(tempCost);
      }
    }
    if (res.length) { // 有满足的配送的方案
      let item = _.minBy(res, 'realCost');
      if (item.realCost) {
        let sameList = res.filter(t => t.realCost === item.realCost);
        sameList = sameList.sort((at, bt) => {
          const a = at.plan;
          const b = bt.plan;
          return a.amount >= b.amount ? -1 : 1;
        });
        item = _.head(sameList);
      }
      this.currentPlan = item;
      this.overBaseWeight = utils.filterSecret(item.overBaseWeight);
      this.overLimitWeight = utils.filterSecret(item.overLimitWeight);
      this.sendPrice = utils.filterSecret(item.sendPrice);
      const limitPrice = item.limitPrice;
      this.getNextPlan(res, limitPrice);
    } else { // 当前的重量和商品價格 没有满足的配送方案
      let tempPlan = '';
      if (planList.length) {
        // 所有的方案
        const allDefault = planList.map(item => this.getDefaultPlan(item, this.totalWeight, this.haveFresh));
        //  存在支持配送的方案
        const canSendPlan = allDefault.filter(item => !item.overWeightCannotSend);
        // 沒有超重 沒達到起送價 起送價最低
        if (canSendPlan.length) {
          // 存在沒達到起送價的方案 可配送方案
          const notReachSendPricePlan = canSendPlan.filter(item => item.plan.amount > this.marketCartPriceTotal);
          if (notReachSendPricePlan.length) {
            tempPlan = _.minBy(canSendPlan, item => item.plan.amount);
            const minAmount = tempPlan.plan.amount;
            const minCanSend = canSendPlan.filter(item => item.plan.amount === minAmount);
            tempPlan = _.minBy(minCanSend, 'realCost');
          }
          // 不顯示下一檔
        } else { // 均超重
          tempPlan = _.maxBy(allDefault, item => item.plan.limitWeight);
          const maxWeight = tempPlan.plan.limitWeight;
          const maxWeightList = allDefault.filter(item => item.plan.limitWeight === maxWeight);
          // 超重里面最便宜的
          tempPlan = _.minBy(maxWeightList, 'realCost');
          // 不顯示下一檔
        }
      }
      if (tempPlan) {
        this.currentPlan = tempPlan;// 最大承重的
        this.sendPrice = utils.filterSecret(tempPlan.sendPrice);// this.incrementAmount + tempPlan?.plan?.amount
        this.overBaseWeight = utils.filterSecret(tempPlan.overBaseWeight);
        this.overLimitWeight = utils.filterSecret(tempPlan.overLimitWeight);
        this.overWeightCannotSend = tempPlan.overWeightCannotSend;
      } else {
        // 没有配送方案
        this.sendPrice = utils.filterSecret(this.getSendPrice());
        this.overBaseWeight = 0;
        this.overLimitWeight = 0;
        this.currentPlan = null;
        this.totalDeliveryFee = 0;
      }
    }
  }

  getStairs(freeDelivery, limit) {
    const res = freeDelivery?.deliveryDetails || [];
    return res.filter(item => item.limitAmount > limit);
  }

  getNextPlan(planList, limitPrice) {
    // const limitPrice = tem.limitPrice;

    // 平臺滿減的門檻
    const deliveryLimit = this.getStairs(this.marketStoreDelivery, limitPrice);
    // 商家滿減的門檻
    const merchantLimit = this.getStairs(this.marketMerchantDeliveryFreeInfo, limitPrice);
    // 預測下一檔 start
    const nextRes = [];
    // 當前滿足的
    for (const item of planList) {
      // 某個方案 比自身大的配送費門檻
      for (const stairsItem of item.otherCostStairs) {
        const costParam = {
          baseCost: stairsItem.cost,
          overWeightCost: item.overWeightCost,
          freshCost: item.freshCost,
          limitPrice: stairsItem.amount
        };
        const { realCost, freeAll, originalTotal } = this.getRealCost(costParam);
        costParam.realCost = realCost;
        costParam.freeAll = freeAll;
        costParam.originalTotal = originalTotal;
        nextRes.push(costParam);
      }

      // 商家的門檻
      for (const mLimit of merchantLimit) {
        const baseCost = this.getBaseCost(item.plan, mLimit.limitAmount);
        const costParam = {
          baseCost,
          overWeightCost: item.overWeightCost,
          freshCost: item.freshCost,
          limitPrice: mLimit.limitAmount
        };
        const { realCost, freeAll, originalTotal } = this.getRealCost(costParam);
        costParam.realCost = realCost;
        costParam.freeAll = freeAll;
        costParam.originalTotal = originalTotal;
        nextRes.push(costParam);
      }

      // 平臺的門檻
      for (const dLimit of deliveryLimit) {
        const baseCost = this.getBaseCost(item.plan, dLimit.limitAmount);
        const costParam = {
          baseCost,
          overWeightCost: item.overWeightCost,
          freshCost: item.freshCost,
          limitPrice: dLimit.limitAmount
        };
        const { realCost, freeAll, originalTotal } = this.getRealCost(costParam);
        costParam.realCost = realCost;
        costParam.freeAll = freeAll;
        costParam.originalTotal = originalTotal;
        nextRes.push(costParam);
      }
    }
    nextRes.sort((a, b) => {
      return a.limitPrice > b.limitPrice ? 1 : -1
    })

    // 預測下一檔 end
    for (const next of nextRes) {
      if (next.realCost <= this.currentPlan.realCost) {
        this.nextPlan = next;
        break;
      }
    }
    this.discountStr();
  }

  discountStr() {
    this.marketDeliveryFeeStr = '';
    if (!this.currentPlan.realCost) {
      this.marketDeliveryFeeStr = '<span class="dis-cart-price">免配送费</span>';
      return;
    }
    // 当前没有下一档
    if (!this.nextPlan) {
      return;
    }
    const {
      limitPrice, realCost
    } = this.nextPlan;
    let str = `滿<span class="dis-cart-price">MOP${limitPrice}</span>`;
    if (realCost) {
      // MOP
      str += `配送費<span class="dis-cart-price">MOP${realCost}</span>起`;
    } else {
      str += `<span class="dis-cart-price">免配送費</span>`;
    }
    this.marketDeliveryFeeStr = str;
  }

  // 獲取當前方案 的  基础配送费 + 超重费用 + 生鲜加收
  getActiveCostPlan(weight, plan) {
    const haveFresh = this.haveFresh;
    // 限制重量
    const limitWeight = plan.limitWeight;
    if (weight > 10000) {
      // this.overWeightCannotSend = true;
      // this.overBaseWeight = utils.filterSecret(this.totalWeight - 10000);
      // this.overLimitWeight = utils.filterSecret(this.totalWeight - 10000);
      return null;
    }
    // 是否滿足起送價
    if (this.marketCartPriceTotal < (plan.amount + this.incrementAmount)) {
      return null;
    }

    // 能否超重
    const overLimitEnable = plan.overLimitEnable;
    // 如果超重，但未开启超重配送，则不计算
    if (weight > limitWeight && !overLimitEnable) {
      return null;
    }
    // 起送价 + 起送价的應急加价
    const sendPrice = this.getSendPrice(plan);
    // 商品金额  实际商品金额与起送价
    const limitPrice = this.getMaxPriceTotal(sendPrice);
    // 获取基础配送费
    const baseCost = this.getBaseCost(plan, limitPrice);
    const baseWeight = plan.baseWeight;
    const freshEnable = plan.freshEnable;// 生鲜是否加价

    // 含有生鲜商品并开启生鲜加收
    let freshCost = 0;
    if (haveFresh && freshEnable) {
      freshCost = plan.freshCost;
    }

    const otherCostStairs = this.getOtherCostStairs(plan, limitPrice);

    // 基础重量大于总总量
    if (baseWeight >= weight) {
      const res = {
        baseCost, // 基礎配送費
        overBaseWeight: 0, // 超出基礎重
        overWeightCost: 0, // 超重的費用
        freshCost, // 生鮮
        limitPrice,
        plan,
        overWeightCannotSend: false, // 超重不能送
        overLimitWeight: 0,
        sendPrice,
        otherCostStairs
      };
      const { realCost, freeAll, originalTotal } = this.getRealCost({
        ...res,
        isCartAmt: true
      });
      // 所有優惠減免后的配送費
      res.realCost = realCost;
      res.freeAll = freeAll;
      // 原來的配送費
      res.originalTotal = originalTotal;
      return res;
    }
    // 超重的重量
    const overBaseWeight = weight - baseWeight < 0 ? 0 : weight - baseWeight;
    // 超重的费用
    const overWeightCost = this.getOverWeightCost(overBaseWeight, plan);
    // 超出上限的重量
    const overLimitWeight = weight - limitWeight < 0 ? 0 : weight - limitWeight;
    // 基础配送费 + 超重费用 + 生鲜加收
    //   baseCost: 0,
    //   overBaseWeight: 0,
    //   overWeightCost: 0,
    //   freshCost: 0,
    //   limitPrice: 0,
    //   plan: 0,
    //   overWeightCannotSend: false,
    //   overLimitWeight: 0,
    //   sendPrice: 0,
    //   otherCostStairs: [],
    //   realCost: 0,
    //   freeAll: false,
    //   originalTotal: 0
    const res = {
      baseCost,
      overBaseWeight,
      overWeightCost,
      freshCost,
      limitPrice,
      plan,
      overWeightCannotSend: false,
      overLimitWeight,
      sendPrice,
      otherCostStairs
    };
    const { realCost, freeAll, originalTotal } = this.getRealCost({
      ...res,
      isCartAmt: true
    });
    // 所有優惠減免后的配送費
    res.realCost = realCost;
    res.freeAll = freeAll;
    // 原來的配送費
    res.originalTotal = originalTotal;
    return res;
  }

  // 獲取起送價加價
  getIncrementAmount() {
    const marketStoreDetail = this.marketStoreDetail;
    const marketOrderOther = this.marketOrderOther;
    let incrementAmount = marketStoreDetail?.incrementAmount || 0;
    if (Object.keys(marketOrderOther?.cookTimeSelectData || {}).length > 0) {
      incrementAmount = marketOrderOther?.cookTimeSelectData?.incrementAmount || 0;
    }
    return incrementAmount;
  }

  /**
  * 获取配送类型
  * @return {Number} 1=专送，4=远程，2=自送
  */
  getDeliveryType() {
    const marketStoreDetail = this.marketStoreDetail;
    const marketOrderOther = this.marketOrderOther;
    let deliveryType = marketStoreDetail?.deliveryType;
    if (Object.keys(marketOrderOther?.cookTimeSelectData || {}).length > 0) {
      deliveryType = marketOrderOther?.cookTimeSelectData.deliveryType;
    }
    return deliveryType;
  }

  // 方案
  getPlanList() {
    const cookTimeSelectData = this.marketOrderOther?.cookTimeSelectData;
    if (cookTimeSelectData?.deliveryStairs) {
      return cookTimeSelectData?.deliveryStairs;
    }
    return this.marketStoreDetail.deliveryStairs || [];// 配送方案列表
  }

  // 起送价
  getSendPrice(plan) {
    return this.incrementAmount + (plan?.amount || 0);
  }

  // 实际商品价格与起送价比较 取最大的
  getMaxPriceTotal(sendPrice) {
    return this.marketCartPriceTotal > sendPrice ? this.marketCartPriceTotal : sendPrice;
  }

  // 獲取當前的配送費
  getDefaultPlan(plan, weight = 0, haveFresh = false) {
    if (!plan) {
      return {
        baseCost: 0,
        overBaseWeight: 0,
        overWeightCost: 0,
        freshCost: 0,
        limitPrice: 0,
        plan: 0,
        overWeightCannotSend: false,
        overLimitWeight: 0,
        sendPrice: 0,
        otherCostStairs: [],
        realCost: 0,
        freeAll: false,
        originalTotal: 0
      };
    }
    // 起送价 + 起送价的應急加价
    const sendPrice = this.getSendPrice(plan);
    // 商品金额  实际商品金额与起送价
    const limitPrice = this.getMaxPriceTotal(sendPrice);
    // 根据 商品金额获取基础配送费
    const baseCost = this.getBaseCost(plan, limitPrice);
    // 基础重量
    const baseWeight = plan.baseWeight;
    // 生鲜是否加价
    const freshEnable = plan.freshEnable;

    // 含有生鲜商品并开启生鲜加收
    let freshCost = 0;
    if (haveFresh && freshEnable) {
      freshCost = plan.freshCost;
    }
    // 限制重量
    const limitWeight = plan.limitWeight;
    // 能否超重
    const overLimitEnable = plan.overLimitEnable;

    // 超重的重量
    let overBaseWeight = weight - baseWeight < 0 ? 0 : weight - baseWeight;
    overBaseWeight = utils.filterSecret(overBaseWeight);
    // 是否顯示超重標識
    let overWeightCannotSend = false;
    // 如果超重，但未开启超重配送，则不计算
    if (weight > limitWeight && !overLimitEnable) {
      overWeightCannotSend = true;
    }
    if (weight > 10000) {
      overWeightCannotSend = true;
    }
    // 超出上限的重量  只有不支持超重的时候显示，支持超重时没有用
    const overLimitWeight = weight - limitWeight < 0 ? 0 : weight - limitWeight;
    // 实际计费的总重量（支持超重则为真实重量，不支持超重则为上限重量）
    const totalWeight = overLimitEnable ? weight : (weight > limitWeight ? limitWeight : weight);
    // 超重的重量
    const overWeight = totalWeight - baseWeight < 0 ? 0 : totalWeight - baseWeight;
    // 超重的费用
    const overWeightCost = this.getOverWeightCost(overWeight, plan);
    // 【用于预测】 比当前挡位价格高的门槛
    const otherCostStairs = this.getOtherCostStairs(plan, limitPrice);
    // 基础配送费 + 超重费用 + 生鲜加收
    const res = {
      baseCost,
      overBaseWeight,
      overWeightCost,
      freshCost,
      limitPrice, // 当前的门槛 （下一档门槛时使用）
      plan,
      overWeightCannotSend,
      overLimitWeight,
      sendPrice,
      otherCostStairs
    };

    const { realCost, freeAll, originalTotal } = this.getRealCost({
      ...res,
      isCartAmt: true
    });
    // 所有優惠減免后的配送費
    res.realCost = realCost;
    res.freeAll = freeAll;
    // 原來的配送費
    res.originalTotal = originalTotal;
    return res;
  }

  // 獲取真實的配送費
  getRealCost({ baseCost, overWeightCost, freshCost, limitPrice, isCartAmt }) {
    // 基础配送费 baseCost
    // 超重配送 overWeightCost
    // 生鲜 freshCost
    // 计算平台、商家满减的门槛 limitPrice
    // 應急加价 this.shippingPriceIncrement
    // 当前生效的平台方案
    limitPrice = isCartAmt ? this.marketCartPriceTotal : limitPrice;
    const plantFree = this.getMarketDeliveryFreeItem(limitPrice);
    // 当前生效的商家方案
    const merchantFree = this.getMerchantDeliveryFreeItem(limitPrice);
    const costParam = {
      baseCost,
      overWeightCost,
      freshCost,
      limitPrice
    };
    const freeData = this.getMarketFreeData(plantFree, merchantFree, costParam);
    // freeData
    // 是否全免 freeAll
    // 原來的配送費 originalTotal
    // 真實配送費 realCost
    return freeData;
  }

  // 根据当前价格
  getOtherCostStairs(plan, nowPrice) {
    if (!plan) return [];
    return plan.costStairs.filter(item => item.amount > nowPrice);
  }

  // 获取基础的配送费
  getBaseCost(plan, totalPrice) {
    if (!plan) {
      return 0;
    }
    const costStairs = plan?.costStairs || [];
    let baseCost = _.head(costStairs)?.cost || 0;
    for (const costItem of costStairs) {
      if (totalPrice >= costItem.amount) {
        baseCost = costItem.cost;
      } else {
        break;
      }
    }
    return baseCost;
  }

  // 超重的费用
  getOverWeightCost(overBaseWeight, plan) {
    const { overWeightCost, overWeightUnit } = plan;
    let overWeightCostTotal = 0;
    let leftWeight = overBaseWeight;
    while (leftWeight > 0 && leftWeight >= 0) {
      leftWeight -= overWeightUnit;
      overWeightCostTotal += overWeightCost;
    }
    return overWeightCostTotal;
  }

  // 获取紧急加价
  getAddPrice() {
    const marketStoreDetail = this.marketStoreDetail;
    const marketOrderOther = this.marketOrderOther;
    let shippingPriceIncrement = marketStoreDetail?.shippingPriceIncrement || 0;
    if (Object.keys(marketOrderOther?.cookTimeSelectData || {}).length > 0) {
      shippingPriceIncrement = marketOrderOther?.cookTimeSelectData?.shippingPriceIncrement || 0;
    }
    return shippingPriceIncrement;
  }

  // 获取商家减免满足的item  next true 找下一档
  getMerchantDeliveryFreeItem(marketCartPriceTotal) {
    // const marketCartPriceTotal = this.marketCartPriceTotal;
    const mFree = this.marketMerchantDeliveryFreeInfo;
    if (!mFree) {
      return "";
    }
    // 全免
    if (mFree.activityType == 1) {
      return {
        freeAll: true, // 全免
        isContainOverWeightAmtn: mFree.isContainOverWeightAmtn, // 能否減免超重
        isContainAddAmtn: mFree.isContainAddAmtn, // 能否减免 紧急加价
        limitAmount: 0,
        amount: 0
      };
    } else {
      let titem = "";
      if (Array.isArray(mFree.deliveryDetails)) {
        // 商家满减阶梯
        for (const item of mFree.deliveryDetails) {
          // 找到满足条件最大的商家减免
          if (marketCartPriceTotal >= item.limitAmount) {
            titem = {
              freeAll: false,
              isContainOverWeightAmtn: mFree.isContainOverWeightAmtn, // 能否減免超重
              isContainAddAmtn: mFree.isContainAddAmtn, // 能否减免 紧急加价
              ...item
            };
          }
        }
        return titem;
      }
      // 没有商家满减
      return titem;
    }
  }

  /**
   * 获取平台减免满足的item
   * @param {Number} marketCartPriceTotal 购物车价格
   * @param {Boolean} next 是否找下一挡
   * @param {Boolean} last 是否获取最后一个元素
   */
  getMarketDeliveryFreeItem(marketCartPriceTotal) {
    // const marketCartPriceTotal = this.marketCartPriceTotal;
    const dFree = this.marketStoreDelivery;
    if (!dFree) {
      return "";
    }

    // 全免
    if (dFree.activityType == 1) {
      return {
        freeAll: true, // 全免
        isContainAddAmtn: dFree.isContainAddAmtn, // 能否减免 紧急加价
        isContainOverWeightAmtn: dFree.isContainOverWeightAmtn, // 能否減免超重
        limitAmount: 0,
        amount: 0,
        isMerchantShare: dFree.isMerchantShare // 與商家減免同享
      };
    } else {
      let titem = "";
      if (Array.isArray(dFree.deliveryDetails)) {
        // 商家满减阶梯
        for (const item of dFree.deliveryDetails) {
          // 找到满足条件最大的商家减免
          if (marketCartPriceTotal >= item.limitAmount) {
            titem = {
              freeAll: false,
              isMerchantShare: dFree.isMerchantShare,
              isContainOverWeightAmtn: dFree.isContainOverWeightAmtn, // 能否減免超重
              isContainAddAmtn: dFree.isContainAddAmtn, // 能否减免 紧急加价
              ...item
            };
          }
        }
      }
      return titem;
    }
  }

  // 商超減免
  getMarketFreeData(plantFree, merchantFree, costParam) {
    const baseFee = costParam?.baseCost || 0;// 基础配送费
    const overWeightCost = costParam?.overWeightCost || 0;// 超重的配送费
    const freshCost = costParam?.freshCost || 0; // 生鮮加價
    const shippingPriceIncrement = this.shippingPriceIncrement;// 加價
    let deliveryFreeShippingPrice = 0;// 平台减免的配送费
    let deliveryFreeOverWeightPrice = 0;// 平台减免的超重配送费
    let deliveryFreeIncrementPrice = 0;// 平台减免的加价

    let merchantFreeShippingPrice = 0;// 商家减免的配送费
    let merchantFreeOverWeightPrice = 0;// 商家减免的超重配送费
    let merchantFreeIncrementPrice = 0;// 商家减免的加价

    // 平臺是否支持減免加價
    const dCanAdd = this.deliveryIsContainAddAmtn;
    // 平臺是否支持減免超重
    const dCanReduceOver = this.deliveryIsContainOverWeightAmtn;

    // 原價
    const originalTotal = utils.filterSecret(shippingPriceIncrement + freshCost + overWeightCost + baseFee);
    // 商家是否支持減免加價
    const mCanAdd = this.merchantIsContainAddAmtn;
    // 商家是否支持減免超重
    const mCanReduceOverWeight = this.merchantIsContainOverWeightAmtn;

    function getResult(freeAll) {
      const realCost = utils.filterSecret(
        shippingPriceIncrement + freshCost + overWeightCost + baseFee -
          (
            deliveryFreeShippingPrice + deliveryFreeIncrementPrice + merchantFreeShippingPrice + merchantFreeIncrementPrice + deliveryFreeOverWeightPrice + merchantFreeOverWeightPrice
          )
      );
      const res = {
        freeAll,
        originalTotal, // 原來的配送費
        // 加價 + 超重  + 生鮮 +  基礎配送費 -  ( 平臺減免基礎配送費 + 平臺減免加價+平臺減免的超重+ 商家減免的基礎配送費 + 商家減免的加價配送費  +  商家減免的超重 )
        // shippingPriceAllFree 全免配送费，直接为0
        realCost: freeAll ? 0 : realCost
      };
      // console.log(res, 'manjian')
      return res;
    }

    // 平臺/商家是否全免
    function isFreeAll(freeAll, canReduceOver, canReduceAdd, overWeightCost = 0, shippingPriceIncrement = 0) {
      if (!freeAll) {
        return false;
      }
      if (freeAll && !overWeightCost && !shippingPriceIncrement) {
        return true;
      }
      let freeFlag = true; // 默认全免
      // 不能减超重费用 && 有超重费用
      if (!canReduceOver && overWeightCost) {
        freeFlag = false;
      }
      // 不支持减应急加价费用 && 有应急加价的费用
      if (!canReduceAdd && shippingPriceIncrement) {
        freeFlag = false;
      }
      return freeFlag;
    }

    // 傳入平臺或者商戶減免活動
    function getDiscountFee(free, baseFee = 0, overWeightCost = 0, shippingPriceIncrement = 0) {
      //     freeAll: true, // 全免
      //     isContainAddAmtn: marketStoreDelivery.isContainAddAmtn, // 能否减免 紧急加价
      //     isContainOverWeightAmtn: marketStoreDelivery.isContainOverWeightAmtn, // 能否減免超重
      //     limitAmount: 0,
      //     amount: 0,
      let disBaseFee = 0;// 減免的基礎
      let disOverWeight = 0;// 減免的超重
      let disIncrement = 0;// 減免的加價
      if (!free) {
        return {
          disBaseFee,
          disOverWeight,
          disIncrement,
          total: 0
        };
      }
      // 全免
      if (free.freeAll) {
        disBaseFee = baseFee;
        if (free.isContainOverWeightAmtn) {
          disOverWeight = overWeightCost;
        }
        if (free.isContainAddAmtn) {
          disIncrement = shippingPriceIncrement;
        }
      } else {
        // 剩餘的優惠金額
        let left = free.amount;
        disBaseFee = baseFee > left ? left : baseFee;
        left -= disBaseFee;
        // 支持減超重 有剩餘優惠金額  有超重費用
        if (free.isContainOverWeightAmtn && left && overWeightCost) {
          disOverWeight = overWeightCost > left ? left : overWeightCost;
          left -= disOverWeight;
        }

        if (free.isContainAddAmtn && left && shippingPriceIncrement) {
          disIncrement = shippingPriceIncrement > left ? left : shippingPriceIncrement;
          left -= disIncrement;
        }
      }
      const res = {
        disBaseFee,
        disOverWeight,
        disIncrement,
        total: utils.filterSecret(disBaseFee + disOverWeight + disIncrement)
      };
      return res;
    }
    // 有平臺滿減 與商家不同享受  有商家減免
    if (plantFree && !plantFree?.isMerchantShare && merchantFree) {
      const disDeliveryItem = getDiscountFee(plantFree, baseFee, overWeightCost, shippingPriceIncrement);
      const disMerchantItem = getDiscountFee(merchantFree, baseFee, overWeightCost, shippingPriceIncrement);
      if (disMerchantItem.total > disDeliveryItem.total) {
        // 商家
        merchantFreeShippingPrice = disMerchantItem.disBaseFee;// 商家减免的配送费
        merchantFreeOverWeightPrice = disMerchantItem.disOverWeight;// 商家减免的超重配送费
        merchantFreeIncrementPrice = disMerchantItem.disIncrement;// 商家减免的加价
        return getResult(isFreeAll(merchantFree.freeAll, mCanReduceOverWeight, mCanAdd, overWeightCost, shippingPriceIncrement));
      } else {
        // 平臺
        deliveryFreeShippingPrice = disDeliveryItem.disBaseFee;// 平台减免的配送费
        deliveryFreeOverWeightPrice = disDeliveryItem.disOverWeight;// 平台减免的超重配送费
        deliveryFreeIncrementPrice = disDeliveryItem.disIncrement;// 平台减免的加价
        return getResult(
          isFreeAll(plantFree.freeAll, dCanReduceOver, dCanAdd, overWeightCost, shippingPriceIncrement));
      }
    }
    let tempBaseFee = baseFee;
    let tempOverWeightCost = overWeightCost;
    let tempIncrement = shippingPriceIncrement;

    const disDeliveryItem = getDiscountFee(plantFree, baseFee, overWeightCost, shippingPriceIncrement);
    deliveryFreeShippingPrice = disDeliveryItem.disBaseFee;// 平台减免的配送费
    deliveryFreeOverWeightPrice = disDeliveryItem.disOverWeight;// 平台减免的超重配送费
    deliveryFreeIncrementPrice = disDeliveryItem.disIncrement;// 平台减免的加价

    tempBaseFee -= deliveryFreeShippingPrice;
    tempOverWeightCost -= deliveryFreeOverWeightPrice;
    tempIncrement -= deliveryFreeIncrementPrice;

    const disMerchantItem = getDiscountFee(merchantFree, tempBaseFee, tempOverWeightCost, tempIncrement);
    // 商家
    merchantFreeShippingPrice = disMerchantItem.disBaseFee;// 商家减免的配送费
    merchantFreeOverWeightPrice = disMerchantItem.disOverWeight;// 商家减免的超重配送费
    merchantFreeIncrementPrice = disMerchantItem.disIncrement;// 商家减免的加价
    const freeAmount = utils.filterSecret(deliveryFreeShippingPrice + deliveryFreeIncrementPrice + deliveryFreeOverWeightPrice +
      merchantFreeShippingPrice + merchantFreeIncrementPrice + merchantFreeOverWeightPrice);
    return getResult(freeAmount === originalTotal);
  }
}

export default NewMarketDeliveryFee;
