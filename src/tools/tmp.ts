let inc = 0;

export function getTmpFolder() {
  inc = (inc + 1) % 100000;
  return `${Date.now()}_${inc}`;
}
