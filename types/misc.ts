export interface DailyDate {
  [key: string]: { selected: boolean; puzzle: Puzzle };
}

export enum StatusOfDaily {
  UNDER_REVIEW,
  PUBLISHED,
}

export interface DateObjString {
  year: string;
  month: string;
  day: string;
}

export enum SignInOptions {
  ANON,
  PHONE,
  EMAIL,
}
