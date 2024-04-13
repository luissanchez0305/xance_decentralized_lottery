import Navigation from "@/components/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PropsWithChildren } from "react";

export default function TopMenu(prop: PropsWithChildren) {
    return (
        <>
        <nav className="bg-white border-gray-200 bg-gradient-to-b from-[#762b8dda] to-indigo-500 mx-auto max-w-md justify-center">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
                <Navigation />
                <a href="/" className="flex items-center">
                    <span className="self-center text-3xl font-semibold whitespace-nowrap dark:text-[#ffffff]">Xance</span>
                </a>
                <div className="block">
                    <ConnectButton chainStatus="none" showBalance={false} />
                </div>
            </div>
        </nav>
        <div>{prop.children}</div>
        </>
    )
}