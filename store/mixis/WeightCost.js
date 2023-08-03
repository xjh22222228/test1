import utils from "@utils";
import _ from "lodash";
class WeightCost {
  constructor(param) {
    // 門店信息
    this.marketStoreDetail = param.marketStoreDetail;
    // 門店選中的信息
    this.marketOrderOther = param.marketOrderOther;
    // 是否有生鮮
    this.haveFresh = param.haveFresh;
    // 起送价
    this.sendPrice = 0;
    // 总价
    this.marketCartPriceTotal = param.marketCartPriceTotal;
    // 超重不能送
    this.overWeightCannotSend = false;
    // 超出基礎配送費的重量
    this.overBaseWeight = 0;
    // 超出上限重量
    this.overLimitWeight = 0;
    // 總重量
    this.totalWeight = utils.filterSecret(param.totalWeight);
    //  當前方案
    this.currentPlan = null;
    // 緊急加價
    this.shippingPriceIncrement = this.getAddPrice();
    // 起送價加價
    this.incrementAmount = this.getIncrementAmount();
    // 所需要的配送费
    this.totalDeliveryFee = 0;
    this.cart();
  }

  // 获取起送价  含紧急加价
  getSendPrice() {
    const marketStoreDetail = this.marketStoreDetail;
    const marketOrderOther = this.marketOrderOther;
    // 起送價
    let sendPrice = marketStoreDetail.sendPrice;
    // 配送費階梯
    if (Object.keys(marketOrderOther?.cookTimeSelectData || {}).length > 0) {
      sendPrice = marketOrderOther?.cookTimeSelectData.sendPrice;
    }
    return sendPrice;
  }

  countTotal() {
    let totalFee = 0;
    if (this.currentPlan) {
      const { baseCost, freshCost, overWeightCost } = this.currentPlan;
      totalFee = utils.filterSecret(
        baseCost + (freshCost || 0) + (overWeightCost || 0)
      );
    }
    // 所需配送费
    this.totalDeliveryFee = utils.filterSecret(
      this.shippingPriceIncrement + totalFee
    );
  }

  cart() {
    const planList = this.getPlanList();
    const totalWeight = this.totalWeight;
    this.overBaseWeight = 0;
    // 超出上限重量
    this.overLimitWeight = 0;
    this.overWeightCannotSend = false;
    if (this.marketCartPriceTotal === 0) {
      // 取起送價最小的方案
      const minPlan = _.minBy(planList, 'amount');
      const minPlanList = planList.filter(item => minPlan.amount);
      const resultPlanList = minPlanList.map(item => this.getDefaultPlan(item));
      const tempPlan = _.minBy(resultPlanList, 'totalCost') || this.getDefaultPlan();
      this.currentPlan = tempPlan;
      this.sendPrice = utils.filterSecret(this.currentPlan.sendPrice);
      this.countTotal();
      return;
    }
    const res = [];
    for (const plan of planList) {
      // 獲取生效的方案
      const tempCost = this.getActiveCostPlan(totalWeight, this.haveFresh, plan); // 超重或者 超重沒有分單
      if (tempCost) {
        res.push(tempCost);
      }
    }
    if (res.length) { // 有满足的配送的方案
      let item = _.minBy(res, 'totalCost');
      if (item.totalCost) {
        let sameList = res.filter(t => t.totalCost === item.totalCost);
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
            tempPlan = _.minBy(minCanSend, 'totalCost');
          }
        } else { // 均超重
          tempPlan = _.maxBy(allDefault, item => item.plan.limitWeight);
          const maxWeight = tempPlan.plan.limitWeight;
          const maxWeightList = allDefault.filter(item => item.plan.limitWeight === maxWeight);
          // 超重里面最便宜的
          tempPlan = _.minBy(maxWeightList, 'totalCost');
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
    this.countTotal();
  }

  getPlanList() {
    const cookTimeSelectData = this.marketOrderOther?.cookTimeSelectData
    if (cookTimeSelectData?.deliveryStairs) {
      return cookTimeSelectData?.deliveryStairs;
    }
    return this.marketStoreDetail.deliveryStairs || [];// 配送方案列表
  }

  // 获取紧急加价
  getAddPrice() {
    const marketStoreDetail = this.marketStoreDetail;
    const marketOrderOther = this.marketOrderOther;
    let shippingPriceIncrement = marketStoreDetail.shippingPriceIncrement || 0;
    if (Object.keys(marketOrderOther?.cookTimeSelectData || {}).length > 0) {
      shippingPriceIncrement = marketOrderOther?.cookTimeSelectData?.shippingPriceIncrement || 0;
    }
    return shippingPriceIncrement;
  }

  // 獲取起送價加價
  getIncrementAmount() {
    const marketStoreDetail = this.marketStoreDetail;
    const marketOrderOther = this.marketOrderOther;
    let incrementAmount = marketStoreDetail.incrementAmount || 0;
    if (Object.keys(marketOrderOther?.cookTimeSelectData || {}).length > 0) {
      incrementAmount = marketOrderOther?.cookTimeSelectData?.incrementAmount || 0;
    }
    return incrementAmount;
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

  // 獲取當前的配送費
  getDefaultPlan(plan, weight = 0, haveFresh = false) {
    if (!plan) {
      return {
        baseCost: 0,
        overBaseWeight: 0,
        overWeightCost: 0,
        freshCost: 0,
        totalCost: 0,
        plan: 0,
        overWeightCannotSend: false,
        overLimitWeight: 0,
        sendPrice: 0
      };
    }
    const sendPrice = this.incrementAmount + (plan?.amount || 0);
    // 获取基础配送费
    const baseCost = this.getBaseCost(plan, this.marketCartPriceTotal > sendPrice ? this.marketCartPriceTotal : sendPrice);
    const baseWeight = plan.baseWeight;
    const freshEnable = plan.freshEnable;// 生鲜是否加价

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
    // 超出上限的重量
    const overLimitWeight = weight - limitWeight < 0 ? 0 : weight - limitWeight;
    const totalWeight = overLimitEnable ? weight : (weight > limitWeight ? limitWeight : weight);
    const overWeight = totalWeight - baseWeight < 0 ? 0 : totalWeight - baseWeight;
    // 超重的费用
    const overWeightCost = this.getOverWeightCost(overWeight, plan);
    // 基础配送费 + 超重费用 + 生鲜加收
    return {
      baseCost,
      overBaseWeight,
      overWeightCost,
      freshCost,
      totalCost: baseCost + overWeightCost + freshCost,
      plan,
      overWeightCannotSend,
      overLimitWeight,
      sendPrice
    };
  }

  // 獲取當前方案 的  基础配送费 + 超重费用 + 生鲜加收
  getActiveCostPlan(weight, haveFresh, plan) {
    // 限制重量
    const limitWeight = plan.limitWeight;
    if (weight > 10000) {
      this.overWeightCannotSend = true;
      this.overBaseWeight = utils.filterSecret(this.totalWeight - 10000);
      this.overLimitWeight = utils.filterSecret(this.totalWeight - 10000);
      return null;
    }
    // 是否滿足起送價
    if (this.marketCartPriceTotal < plan.amount) {
      return null;
    }

    // 能否超重
    const overLimitEnable = plan.overLimitEnable;
    // 如果超重，但未开启超重配送，则不计算
    if (weight > limitWeight && !overLimitEnable) {
      // this.overWeightCannotSend = true;
      return null;
    }
    const sendPrice = this.incrementAmount + plan?.amount;
    // 获取基础配送费
    const baseCost = this.getBaseCost(plan, this.marketCartPriceTotal > sendPrice ? this.marketCartPriceTotal : sendPrice);
    const baseWeight = plan.baseWeight;
    const freshEnable = plan.freshEnable;// 生鲜是否加价

    // 含有生鲜商品并开启生鲜加收
    let freshCost = 0;
    if (haveFresh && freshEnable) {
      freshCost = plan.freshCost;
    }
    // 基础重量大于总总量
    if (baseWeight >= weight) {
      return {
        baseCost,
        overBaseWeight: 0,
        overLimitWeight: 0,
        overWeightCost: 0,
        freshCost,
        totalCost: baseCost + freshCost,
        plan,
        sendPrice
      };
    }
    // 超重的重量
    const overBaseWeight = weight - baseWeight < 0 ? 0 : weight - baseWeight;
    // 超重的费用
    const overWeightCost = this.getOverWeightCost(overBaseWeight, plan);
    // 超出上限的重量
    const overLimitWeight = weight - limitWeight < 0 ? 0 : weight - limitWeight;
    // 基础配送费 + 超重费用 + 生鲜加收
    return {
      baseCost,
      overBaseWeight,
      overWeightCost,
      freshCost,
      totalCost: baseCost + overWeightCost + freshCost,
      plan,
      overLimitWeight,
      sendPrice
    };
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
}

export default WeightCost;

// DEMO
// new WeightCost({
//   marketStoreDetail:this.marketStoreDetail,
//   marketOrderOther:this.marketOrderOther,
//   haveFresh:this.haveFresh,
//   totalWeight:this.totalWeight,
//   marketCartPriceTotal: totalPrice
// })

// const plan = {
//   "limitWeight": 100,
//   "overLimitEnable": true,
//   "baseCost": 10,
//   "baseWeight": 10,
//   "freshEnable": true,
//   "freshCost": 5,
// }
// const costPlan = getCostPlan(60, true, plan)
// console.info(JSON.stringify(costPlan))
