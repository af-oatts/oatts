import { Duration } from "dayjs/plugin/duration";

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

export function DurationToString(timespan: Duration | undefined) {
  if (timespan === undefined) {
    return "";
  }
  let str = timespan.hours() === undefined ? "" : `${timespan.hours()}h `;
  str += `${timespan.minutes()}m`
  return str;
}