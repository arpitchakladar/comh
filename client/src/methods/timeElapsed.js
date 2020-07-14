export default time => {
  const Etime = Date.now() - Date.parse(time);

  let t = 12 * 30 * 24 * 60 * 60 * 1000;

  if (Etime > t) {
    return `${Math.floor(Etime / t)} years`;
  }

  t /= 12;
  if (Etime > t) {
    return `${Math.floor(Etime / t)} months`;
  }

  t /= 30;
  if (Etime > t) {
    return `${Math.floor(Etime / t)} days`;
  }

  t /= 24;
  if (Etime > t) {
    return `${Math.floor(Etime / t)} hours`;
  }

  t /= 60;
  if (Etime > t) {
    return `${Math.floor(Etime / t)} mins`;
  }

  t /= 60;
  if (Etime > t) {
    return `${Math.floor(Etime / t)} secs`;
  }

  return '0 secs';
};
