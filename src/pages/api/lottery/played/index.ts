import prisma from '../../../../../db/prisma';
import { NextApiRequest, NextApiResponse } from "next";

const POST = async (
    req: NextApiRequest,
    res: NextApiResponse) => {
  try {
    const { address, lottery_id} = req.body;
    const lottery = await prisma.lottery.findFirst({
        where: {
            id: lottery_id
        }
    });
    if(!lottery) return res.status(404).json({message: "Lottery not found"})

    const played = await prisma.lottery_players.findMany({
      where: {
        playerWallet: address,
        lottery_id: lottery_id,
      },
    });

    if(played.length > 0) return res.status(200).json({message: "Player already played this lottery"});

    const newLotteryPlayed = await prisma.lottery_players.create({
        data: {
            playerWallet: address,
            lottery_id: lottery_id
        }
    })
    res.status(200).json(newLotteryPlayed);
  } catch (err) {
    console.log(err);
    res.status(403).json({ err: "Error occured while adding a new lottery played." });
  }
}

export default POST;