import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const SUI_GRAPHQL_ENDPOINT = "https://sui-mainnet.mystenlabs.com/graphql";

/**
 * useGetNsFromAddress
 * Fetches the default SuiNS name associated with a wallet address.
 * 
 * @param address - The Sui wallet address (e.g. "0xabc...")
 */
export const useGetNsFromAddress = (address: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["suins-name", address],
    queryFn: async () => {
      if (!address) throw new Error("Wallet address is required");

      const query = `
        query($address: SuiAddress!) {
          address(address: $address) {
            defaultSuinsName
          }
        }
      `;

      const { data } = await axios.post(SUI_GRAPHQL_ENDPOINT, {
        query,
        variables: { address },
      });
      console.log(data)

      return data?.data?.address?.defaultSuinsName || null;
    },
    enabled: options?.enabled && !!address, // only runs when address exists
    staleTime: 1000 * 60, // 1 min cache
    retry: 1,
  });
};
