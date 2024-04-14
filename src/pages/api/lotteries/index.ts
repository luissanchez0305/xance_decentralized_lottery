import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../db/prisma';

const GET = async (
  req: NextApiRequest,
  res: NextApiResponse) => {
  try {
    const lotteries = await prisma.lottery.findMany({
        orderBy: {
            lotteryDate: 'asc'
        }
    })
    
    res.status(200).json(lotteries);
  } catch (err) {
    console.log(err);
    res.status(403).json({ err: "Error occured while adding a new food." });
  }
}

export default GET;