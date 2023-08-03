export default [
  {
    path: "/market/seckill",
    name: "marketSeckill",
    component: () => import("./index.vue"),
    meta: { title: "mFood", keepAlive: true, auth: false, keepTop: true }
  }
];
