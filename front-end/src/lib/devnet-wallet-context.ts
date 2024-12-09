import { createContext, useContext } from 'react';

export interface DevnetWallet {
  stxAddress: string;
  label: string;
  mnemonic: string;
}

export interface DevnetWalletContextType {
  currentWallet: DevnetWallet | null;
  wallets: DevnetWallet[];
  setCurrentWallet: (wallet: DevnetWallet) => void;
}

export const devnetWallets: DevnetWallet[] = [
  { 
    stxAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 
    label: 'Deployer',
    mnemonic: 'twice kind fence tip hidden tilt action fragile skin nothing glory cousin green tomorrow spring wrist shed math olympic multiply hip blue scout claw'
  },
  { 
    stxAddress: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5', 
    label: 'Wallet 1',
    mnemonic: 'sell invite acquire kitten bamboo drastic jelly vivid peace spawn twice guilt pave pen trash pretty park cube fragile unaware remain midnight betray rebuild'
  },
  { 
    stxAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG', 
    label: 'Wallet 2',
    mnemonic: 'hold excess usual excess ring elephant install account glad dry fragile donkey gaze humble truck breeze nation gasp vacuum limb head keep delay hospital'
  },
  { 
    stxAddress: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC', 
    label: 'Wallet 3',
    mnemonic: 'cycle puppy glare enroll cost improve round trend wrist mushroom scorpion tower claim oppose clever elephant dinosaur eight problem before frozen dune wagon high'
  },
  { 
    stxAddress: 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND', 
    label: 'Wallet 4',
    mnemonic: 'board list obtain sugar hour worth raven scout denial thunder horse logic fury scorpion fold genuine phrase wealth news aim below celery when cabin'
  },
  { 
    stxAddress: 'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB', 
    label: 'Wallet 5',
    mnemonic: 'hurry aunt blame peanut heavy update captain human rice crime juice adult scale device promote vast project quiz unit note reform update climb purchase'
  },
];

export const DevnetWalletContext = createContext<DevnetWalletContextType>({
  currentWallet: null,
  wallets: devnetWallets,
  setCurrentWallet: () => {},
});

export const useDevnetWallet = () => useContext(DevnetWalletContext);
