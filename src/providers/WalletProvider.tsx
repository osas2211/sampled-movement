import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";
import { AptosConfig, Network } from "@aptos-labs/ts-sdk";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  // @ts-expect-error - empty plugins array for AIP 62 non-compliant wallets
  const wallets = [
    // add plugins for non AIP 62 compliant wallets here
  ];
  const config = new AptosConfig({
    network: Network.TESTNET,
    fullnode: "https://testnet.movementnetwork.xyz/v1",
    faucet: "https://faucet.testnet.movementnetwork.xyz/",
  });

  return (
    <AptosWalletAdapterProvider
      // @ts-expect-error - plugins type mismatch with empty array
      plugins={wallets}
      autoConnect={true}
      dappConfig={config}
      onError={(error) => {
        console.log("error", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};
