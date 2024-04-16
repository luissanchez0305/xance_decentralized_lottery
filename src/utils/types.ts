export type lotteryType = {
    id: number;
    contractHash: string;
    tokenHash: string;
    createdDate: Date;
    lotteryDate: Date;
    country: string;
  }

export type NumberType = {
  value: string,
  qty: number
}