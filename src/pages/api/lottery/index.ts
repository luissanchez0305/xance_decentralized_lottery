import { NextResponse } from "next/server";
import prisma from '../../../../db/prisma';
import { NextApiRequest, NextApiResponse } from "next";

const POST = async (
    req: NextApiRequest,
    res: NextApiResponse) => {
  try {
    const { contractHash, tokenHash, lotteryDate, country } = req.body;

    const newLottery = await prisma.lottery.create({
        data: {
            contractHash,
            tokenHash,
            lotteryDate,
            country,
        }
    })
    res.status(200).json(newLottery);
  } catch (err) {
    console.log(err);
    res.status(403).json({ err: "Error occured while adding a new lottery played." });
  }
}

export default POST;