import utils from '@/JS/utils';

// 已打烊，获取下一个营业时间，By: 星智
export function nextDayOpeningTime(storeData) {
  const listMap = storeData.listMap;
  if (!listMap) { return; }
  const date = new Date();
  const day = date.getDay();
  const time = listMap[day];
  if (time) {
    for (const tt of time) {
      const ft = utils.dateFormat(date, 'hh:mm');
      if (tt.startTime > ft) {
        return tt.startTime + '營業';
      }
    }
  }
  for (let index = 1; index <= 7; index++) {
    const nextday = (day + index) % 7;
    const time = listMap[nextday];
    if (!time) {
      continue;
    }
    if (time[0]) {
      const pre = index === 1 ? '明天' : utils.parseWeekDayLabel(nextday);
      return pre + time[0].startTime + '營業';
    }
  }
}
