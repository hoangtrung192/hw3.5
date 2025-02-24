import * as react_jsx_runtime from 'react/jsx-runtime';
import { Asset, Wallet, AccountInfo } from '@meshsdk/common';
import * as _meshsdk_wallet from '@meshsdk/wallet';
import { BrowserWallet } from '@meshsdk/wallet';
import * as react from 'react';

interface ButtonProps$1 {
    label?: string;
    onConnected?: Function;
    isDark?: boolean;
    metamask?: {
        network: string;
    };
    extensions?: number[];
}
declare const CardanoWallet: ({ label, onConnected, isDark, metamask, extensions, }: ButtonProps$1) => react_jsx_runtime.JSX.Element;

interface WalletContext {
    hasConnectedWallet: boolean;
    connectedWalletInstance: BrowserWallet;
    connectedWalletName: string;
    connectingWallet: boolean;
    connectWallet?: (walletName: string, extensions?: number[]) => Promise<void>;
    disconnect?: () => void;
    error?: unknown;
}
declare const WalletContext: react.Context<WalletContext>;

interface Props {
    children: React.ReactNode;
}
declare const MeshProvider: React.FC<Props>;

declare const useAddress: (accountId?: number) => string | undefined;

declare const useAssets: () => Asset[] | undefined;

declare const useWalletList: ({ metamask, }?: {
    metamask?: {
        network: string;
    };
}) => Wallet[];

declare const useLovelace: () => string | undefined;

declare const useNetwork: () => number | undefined;

declare const useRewardAddress: (accountId?: number) => string | undefined;

declare const useWallet: () => {
    name: string;
    connecting: boolean;
    connected: boolean;
    wallet: _meshsdk_wallet.BrowserWallet;
    connect: (walletName: string, extensions?: number[]) => Promise<void>;
    disconnect: () => void;
    error: unknown;
};

declare const useWalletSubmit: () => {
    error: unknown;
    result: string | undefined;
    submitting: boolean;
    submitTx: (signedTx: string) => Promise<void>;
};

declare const MeshBadge: ({ isDark }: {
    isDark?: boolean | undefined;
}) => react_jsx_runtime.JSX.Element;

interface ButtonProps {
    label?: string;
    isDark?: boolean;
    poolId: string;
    onCheck: (rewardAddress: string) => Promise<AccountInfo>;
    onDelegated?: () => void;
}
declare const StakeButton: ({ label, isDark, poolId, onCheck, onDelegated, }: ButtonProps) => react_jsx_runtime.JSX.Element;

export { CardanoWallet, MeshBadge, MeshProvider, StakeButton, WalletContext, useAddress, useAssets, useLovelace, useNetwork, useRewardAddress, useWallet, useWalletList, useWalletSubmit };
