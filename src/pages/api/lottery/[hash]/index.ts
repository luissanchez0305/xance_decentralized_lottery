import prisma from '../../../../../db/prisma';
import { NextApiRequest, NextApiResponse } from "next";

const GET = async (
  req: NextApiRequest,
  res: NextApiResponse) => {
  try {
    const { hash } = req.query
    if(!hash){
        return res.status(400).json({err: "Address is required"})
    }
    
    const data = await prisma.lottery.findFirst({
        where: {
            contractHash: hash as string
        },
    })
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(403).json({ err: "Error occured while adding a new food." });
  }
}

export default GET;