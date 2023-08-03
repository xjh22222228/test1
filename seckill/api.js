import { post } from "@ajax";
// 【限时秒杀】
// 获取品类推荐秒杀分类列表
export function ApiGetSkCategory (data) {
  return post('/market/seckill/product/getCategoryList', data);
}

// 获取品类推荐秒杀商品列表
export function ApiGetSkProduct (data) {
  return post('/market/seckill/product/getCategorySeckillProductList', data);
}
// 筛选列表
export function ApiGetScreenList () {
  return post('/market/seckill/product/getScreenList', {});
}

// 获取今期推荐秒杀商品列表
export function ApiGetTodaySkList () {
  return post('/market/seckill/product/getTodaySeckillProductList', {});
}
