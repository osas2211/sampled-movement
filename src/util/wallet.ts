import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export type Balance = {
  asset_type: string;
  balance: string;
  symbol?: string;
  decimals?: number;
};

// Movement Network configuration
const MOVEMENT_TESTNET_CONFIG = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: "https://testnet.movementnetwork.xyz/v1",
});

const aptos = new Aptos(MOVEMENT_TESTNET_CONFIG);

export const fetchBalance = async (address: string): Promise<Balance[]> => {
  try {
    // Fetch account resources to get MOVE balance
    const resources = await aptos.getAccountResources({
      accountAddress: address,
    });

    const balances: Balance[] = [];

    // Find the coin store for MOVE (native token)
    const coinStore = resources.find(
      (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
    );

    if (coinStore) {
      const coinData = coinStore.data as { coin: { value: string } };
      balances.push({
        asset_type: "native",
        balance: (Number(coinData.coin.value) / 1e8).toFixed(4), // MOVE has 8 decimals
        symbol: "MOVE",
        decimals: 8,
      });
    } else {
      // Account exists but has no MOVE balance
      balances.push({
        asset_type: "native",
        balance: "0",
        symbol: "MOVE",
        decimals: 8,
      });
    }

    return balances;
  } catch (error) {
    console.error("Error fetching balance:", error);
    // Return zero balance if account not found
    return [
      {
        asset_type: "native",
        balance: "0",
        symbol: "MOVE",
        decimals: 8,
      },
    ];
  }
};

export const formatBalance = (
  balance: string,
  decimals: number = 4,
): string => {
  const num = parseFloat(balance);
  if (isNaN(num)) return "0";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};
