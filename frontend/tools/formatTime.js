function pad(num, size) {
  const s = '000000000' + num
  return s.substr(s.length - size)
}

export function toMinutesAndSeconds(time) {
  const all = Math.abs(Math.round(time))
  const seconds = all % 60
  const hours = Math.floor(all / 3600)
  const minutes = (all - hours * 3600 - seconds) / 60
  return `${Math.sign(time) < 0 ? '-' : ''}${hours ? hours + ':' : ''}${pad(
    minutes,
    2
  )}:${pad(seconds, 2)}`
}
