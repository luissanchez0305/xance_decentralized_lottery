'use client'
import Link from "next/link";
import { useEffect, useState } from "react";

const Sidebar = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex flex-col w-full">
      <div
        className="fixed top-0 bg-transparent mx-auto"
        style={{
          opacity: `${isOpen ? "0" : "1"}`,
          alignSelf: 'center',
        }}
      >
        <button className="flex justify-start text-[1rem]" onClick={toggle}>
          {/* Close icon */}
          <svg xmlns="http://www.w3.org/2000/svg"  version="1.1" width="24" height="24" viewBox="0 0 256 256">
            <defs>
            </defs>
            <g style={{
                        stroke: 'none', 
                        strokeWidth: '0', 
                        strokeDasharray: 'none', 
                        strokeLinecap: 'butt', 
                        strokeLinejoin: 'miter', 
                        strokeMiterlimit: '10', 
                        fill: 'none', 
                        fillRule: 'nonzero', 
                        opacity: 1,
              }} transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
              <path d="M 90 24.25 c 0 -0.896 -0.342 -1.792 -1.025 -2.475 c -1.366 -1.367 -3.583 -1.367 -4.949 0 L 45 60.8 L 5.975 21.775 c -1.367 -1.367 -3.583 -1.367 -4.95 0 c -1.366 1.367 -1.366 3.583 0 4.95 l 41.5 41.5 c 1.366 1.367 3.583 1.367 4.949 0 l 41.5 -41.5 C 89.658 26.042 90 25.146 90 24.25 z" style={{
                            stroke: 'none',
                            strokeWidth: 1,
                            strokeDasharray: 'none', 
                            strokeLinecap: 'butt', 
                            strokeLinejoin: 'miter', 
                            strokeMiterlimit: 10, 
                            fill: 'rgb(216,206,226)', 
                            fillRule: 'nonzero', 
                            opacity: 1,
                }} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
            </g>
          </svg>
        </button>  
      </div>
      <div className="w-[300px] h-[23vh] bg-[#e7e7ff] fixed transition-[0.6s] z-[1000] text-[#474545] rounded-b-xl rounded-bl-xl shadow-2xl ml-16" 
      style={{
        top: isOpen ? '0' : '-100%'
      }}>
        <h1 className=" text-[24px] text-center">Menu</h1>
        <li className="list-none flex items-center content-start w-full pt-3 px-0">
          <Link style={{marginLeft: '16px'}} href="/" onClick={toggle}><p>Home</p></Link>
        </li>
        <li className="list-none flex items-center content-start w-full pt-3 px-0">
          <Link style={{marginLeft: '16px'}} href="/lotteries" onClick={toggle}><p>Sorteos</p></Link>
        </li>
        <li className="list-none flex items-center content-start w-full pt-3 px-0">
          <Link style={{marginLeft: '16px'}} href="/my-lotteries" onClick={toggle}><p>Mis sorteos</p></Link>
        </li>
        <div className="flex flex-wrap content-center w-full pt-3 px-0">
          <button className="flex justify-end mt-[0.75rem] mx-auto" style={{
            color: '#000',
          }} onClick={toggle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"> 
            <path
              fill="currentColor"
              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
            />
          </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;