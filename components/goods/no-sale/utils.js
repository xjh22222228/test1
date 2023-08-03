
// 是否不可售
export function isNoSale(product = {}) {
  // 不可售 && 不是售罄
  return product.availableType === false && product.sellout === false;
}
