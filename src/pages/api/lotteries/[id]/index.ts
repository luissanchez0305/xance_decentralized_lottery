import prisma from '../../../../../db/prisma';
import { NextApiRequest, NextApiResponse } from "next";

const GET = async (
  req: NextApiRequest,
  res: NextApiResponse) => {
  try {
    const { id } = req.query
    if(!id){
        return res.status(400).json({err: "Address is required"})
    }
    
    const data = await prisma.lottery_players.findMany({
        where: {
            playerWallet: id as string
        },
        include: {
            lotteryPlayed: true
        }
    })
    res.status(200).json(data.map((lottery: any) => lottery.lotteryPlayed));
  } catch (err) {
    console.log(err);
    res.status(403).json({ err: "Error occured while adding a new food." });
  }
}

export default GET;