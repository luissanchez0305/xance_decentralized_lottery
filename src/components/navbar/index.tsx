import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import Button from "./Button";

type Props = {
  toggle: () => void;
};
const Navbar = ({toggle}: Props) => {
  return (
    <>
      <div className="w-[25%] h-20 bg-transparent sticky top-0">
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full">
            <Logo />
            <ul className="hidden md:flex gap-x-6 text-white">
              <li>
                <Link href="/lotteries">
                  <p>Sorteos1</p>
                </Link>
              </li>
            </ul>
            <Button />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;