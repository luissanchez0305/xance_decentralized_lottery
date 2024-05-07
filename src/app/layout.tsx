'use client'
import './globals.css'
import { Inter } from 'next/font/google'
import { GameProvider } from '../contexts/gameContext'
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  bsc,
  bscTestnet,
  goerli,
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';
import { json } from 'stream/consumers';
import TopMenu from '@/components/topMenu';

const { chains, publicClient } = configureChains(
  [bsc],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID! }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Xance',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID!,
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <GameProvider>
              <TopMenu>
                {children}
              </TopMenu>
            </GameProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}
