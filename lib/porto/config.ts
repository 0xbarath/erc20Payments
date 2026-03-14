import { createConfig, http } from "wagmi";
import { baseSepolia, optimismSepolia } from "viem/chains";
import { porto } from "porto/wagmi";

export const wagmiConfig = createConfig({
  chains: [baseSepolia, optimismSepolia],
  connectors: [porto()],
  transports: {
    [baseSepolia.id]: http(),
    [optimismSepolia.id]: http(),
  },
  ssr: true,
});
