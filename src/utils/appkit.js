import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { bsc } from '@reown/appkit/networks';

const projectId = '5b67d48b6dcd5604361d12e6773e2c16';

const metadata = {
  name: 'DiamondWall',
  description: 'Real-yield DeFi platform on BSC Mainnet',
  url: 'https://diamondwallcoin.com',
  icons: ['https://diamondwallcoin.com/logo.jpg']
};

createAppKit({
  adapters: [new EthersAdapter()],
  networks: [bsc],
  metadata,
  projectId,
  features: {
    analytics: true,
    email: false,
    socials: false,
    onramp: false,
    swaps: false
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#00d4ff',
    '--w3m-border-radius-master': '8px',
    '--w3m-font-family': 'inherit'
  }
});
