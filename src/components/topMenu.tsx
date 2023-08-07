import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function TopMenu() {
    return (
        <nav className="bg-white border-gray-200 dark:bg-gray-900">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
                <a href="/" className="flex items-center">
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Xance</span>
                </a>
            </div>
            <div className="md:block md:w-auto">
                <ConnectButton chainStatus="none" showBalance={false} />
            </div>
        </nav>
    )
}