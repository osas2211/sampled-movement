import { useCallback, useEffect, useState } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { fetchBalance, type Balance } from "../util/wallet"

const formatter = new Intl.NumberFormat()

const checkFunding = (balances: Balance[]) =>
  balances.some(({ balance }) =>
    !Number.isNaN(Number(balance)) ? Number(balance) > 0 : false,
  )

type WalletBalance = {
  balances: Balance[]
  MOVE: string
  isFunded: boolean
  isLoading: boolean
  error: Error | null
}

export const useWalletBalance = () => {
  const { account } = useWallet()
  const address = account?.address?.toString()

  const [state, setState] = useState<WalletBalance>({
    balances: [],
    MOVE: "-",
    isFunded: false,
    isLoading: false,
    error: null,
  })

  const updateBalance = useCallback(async () => {
    if (!address) return
    try {
      setState((prev) => ({ ...prev, isLoading: true }))
      const balances = await fetchBalance(address)
      const isFunded = checkFunding(balances)
      const native = balances.find(({ asset_type }) => asset_type === "native")
      setState({
        isLoading: false,
        balances,
        MOVE: native?.balance ? formatter.format(Number(native.balance)) : "-",
        isFunded,
        error: null,
      })
    } catch (err) {
      if (err instanceof Error && err.message.match(/not found/i)) {
        setState({
          isLoading: false,
          balances: [],
          MOVE: "-",
          isFunded: false,
          error: new Error("Error fetching balance. Is your wallet funded?"),
        })
      } else {
        console.error(err)
        setState({
          isLoading: false,
          balances: [],
          MOVE: "-",
          isFunded: false,
          error: new Error("Unknown error fetching balance."),
        })
      }
    }
  }, [address])

  useEffect(() => {
    void updateBalance()
  }, [updateBalance])

  return {
    ...state,
    updateBalance,
  }
}
