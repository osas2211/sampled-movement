/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-enum-comparison, @typescript-eslint/no-misused-promises */
"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { getAptosWallets } from "@aptos-labs/wallet-standard";
import { Modal, Button, Spin } from "antd";
import { toast } from "sonner";
import { IoWallet, IoClose } from "react-icons/io5";
import { FiExternalLink } from "react-icons/fi";
import { BsCheckCircleFill } from "react-icons/bs";
import { Network } from "@aptos-labs/ts-sdk";

export function WalletSelectionModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const { wallets, connect } = useWallet();

  // Filter and prioritize wallets
  const filteredWallets = wallets
    .filter((wallet) => {
      const name = wallet.name.toLowerCase();
      // Filter out incompatible wallets
      return (
        !name.includes("petra") &&
        !name.includes("google") &&
        !name.includes("apple")
      );
    })
    .filter((wallet, index, self) => {
      // Remove duplicates
      return index === self.findIndex((w) => w.name === wallet.name);
    })
    .sort((a, b) => {
      // Nightly wallet first (best Movement support)

      if (a.name.toLowerCase().includes("nightly")) return -1;

      if (b.name.toLowerCase().includes("nightly")) return 1;
      return 0;
    });

  const handleWalletSelect = async (walletName: string) => {
    setConnecting(walletName);
    try {
      // IMPORTANT: Connect with Movement network info
      if (typeof window !== "undefined") {
        const allWallets = getAptosWallets();
        const selectedWallet = allWallets.aptosWallets.find(
          (w) => w.name === walletName,
        );

        if (selectedWallet?.features?.["aptos:connect"]) {
          // Connect directly to Movement Network
          const networkInfo = {
            chainId: 250, // Movement Testnet
            name: Network.CUSTOM,
            url: "https://testnet.movementnetwork.xyz/v1",
          };

          const result = await selectedWallet.features["aptos:connect"].connect(
            true,
            networkInfo,
          );

          if (result.status === "Approved") {
            connect(walletName);
            toast.success("Wallet connected successfully!", {
              icon: <BsCheckCircleFill className="text-primary" />,
            });
            setOpen(false);
            setConnecting(null);
            return;
          }
        }
      }

      // Fallback
      connect(walletName);
      // toast.success("Wallet connected successfully!", {
      //   icon: <BsCheckCircleFill className="text-primary" />,
      // });
      setOpen(false);
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Failed to connect wallet. Please try again.");
    } finally {
      setConnecting(null);
    }
  };

  const isNightly = (name: string) => name.toLowerCase().includes("nightly");

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        width={420}
        closeIcon={<IoClose className="text-grey-300 text-xl" />}
        className="wallet-modal"
        styles={{
          content: {
            padding: 0,
            borderRadius: "16px",
            backgroundColor: "#1b1819",
            border: "1px solid #262424",
          },
          mask: { backdropFilter: "blur(8px)" },
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <IoWallet className="text-primary text-2xl" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Connect Wallet
            </h2>
            <p className="text-grey-400 text-sm">
              Select a wallet to connect to Sampled
            </p>
          </div>

          {/* Wallet List */}
          <div className="space-y-3">
            {filteredWallets.length > 0 ? (
              filteredWallets.map((wallet) => {
                const walletName = wallet.name;
                const walletIcon = wallet.icon as string | undefined;

                return (
                  <button
                    key={walletName}
                    onClick={() => handleWalletSelect(walletName)}
                    disabled={connecting !== null}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                      ${
                        connecting === walletName
                          ? "bg-primary/10 border-primary"
                          : "bg-grey-800 border-grey-700 hover:border-primary/50 hover:bg-grey-700"
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    <div className="w-10 h-10 rounded-lg bg-grey-700 flex items-center justify-center overflow-hidden">
                      {walletIcon ? (
                        <img
                          src={walletIcon}
                          alt={walletName}
                          className="w-6 h-6"
                        />
                      ) : (
                        <IoWallet className="text-grey-400 text-xl" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {walletName}
                        </span>
                        {isNightly(walletName) && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      {isNightly(walletName) && (
                        <p className="text-grey-400 text-xs mt-0.5">
                          Best Movement Network support
                        </p>
                      )}
                    </div>
                    {connecting === walletName ? (
                      <Spin size="small" />
                    ) : (
                      <FiExternalLink className="text-grey-400" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-grey-400 mb-4">
                  No compatible wallets found
                </p>
                <Button
                  type="primary"
                  href="https://nightly.app/"
                  target="_blank"
                  className="!bg-primary !text-black !border-0"
                >
                  Install Nightly Wallet
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-grey-700">
            <p className="text-grey-500 text-xs text-center">
              By connecting, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
