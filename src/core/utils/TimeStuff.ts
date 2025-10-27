

export type Timespan = {
  years?: number,
  months?: number,
  weeks?: number,
  days?: number,
  hours?: number,
  minutes?: number,
  seconds?: number,
}

export function FromIsoTimespan(isoString: string): Timespan | undefined {
  const regex = /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoString.match(regex);
  if (matches === null) {
    return undefined;
  }
  const [, years, months, weeks, days, hours, minutes, seconds] = matches.map(Number);
  return {
    years: years,
    months: months,
    weeks: weeks,
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds
  };
}

export function SecondsToTimeString(seconds: number | undefined) {
  if (seconds === undefined) return "";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  let str = hours > 0 ? `${hours}h ` : "";
  str += `${minutes}m`;
  
  return str;
}