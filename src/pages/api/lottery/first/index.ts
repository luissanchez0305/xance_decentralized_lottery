import { NextResponse } from "next/server";
import prisma from '../../../../../db/prisma';
import { NextApiRequest, NextApiResponse } from "next";

const GET = async (
  req: NextApiRequest,
  res: NextApiResponse) => {
  try {
    const lottery = await prisma.lottery.findFirst({
      orderBy: {
        lotteryDate: 'desc',
      }
    });

    console.log('lottery', lottery);
    if(!lottery) return res.status(404).json({message: "Lottery not found"})

    res.status(200).json(lottery);
  } catch (err) {
    console.log(err);
    res.status(403).json({ err: "Error occured while adding a new food." });
  }
}

export default GET;