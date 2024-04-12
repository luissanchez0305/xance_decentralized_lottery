import { NextResponse } from "next/server";
import prisma from '../../../db/prisma';

const GET = async (req, res) => {
    try{
    const lottery = await prisma.lottery.findFirst();
    res.status(200).json(lottery);
  } catch (err) {
    console.log(err);
    res.status(403).json({ err: "Error occured while adding a new food." });
  }
}

export default GET;