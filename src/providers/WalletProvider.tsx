import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";
import { Network } from "@aptos-labs/ts-sdk";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: Network.TESTNET,
        aptosConnectDappId: undefined, // Disable AptosConnect (doesn't support custom networks)
      }}
      optInWallets={["Nightly", "Pontem Wallet"]}
      onError={(error) => {
        console.log("Wallet error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};
