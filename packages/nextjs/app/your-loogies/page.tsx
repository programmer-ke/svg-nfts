"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { LoogiesDisplay } from "~~/components/LoogiesDisplay";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const YourLoogies: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: price } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "price",
  });
  const [loadingLoogies, setLoadingLoogies] = useState(true);
  const [yourLoogies, setYourLoogies] = useState<any[]>();

  const [page, setPage] = useState(1n);
  const perPage = 12n;

  const { data: addressTokenCount } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "YourCollectible" });

  const { data: contract } = useScaffoldContract({ contractName: "YourCollectible" });

  useEffect(() => {
    async function updateAllLoogies() {
      setLoadingLoogies(true);
      if (contract && addressTokenCount && connectedAddress) {
        const collectibleUpdate = [];
        const offset = (page - 1n) * perPage;
        // displaying in descending order of indices
        const remainder = addressTokenCount - offset;
        const startIndex = remainder - 1n;
        const stopIndex = remainder > perPage ? startIndex - perPage : startIndex - remainder;
        for (let tokenIndex = startIndex; tokenIndex > stopIndex; tokenIndex--) {
          try {
            const tokenId = await contract.read.tokenOfOwnerByIndex([connectedAddress, tokenIndex]);
            const tokenURI = await contract.read.tokenURI([tokenId]);
            const jsonManifestString = atob(tokenURI.substring(29));

            try {
              const jsonManifest = JSON.parse(jsonManifestString);
              collectibleUpdate.push({ id: tokenId, uri: tokenURI, ...jsonManifest });
            } catch (e) {
              console.log(e);
            }
          } catch (e) {
            console.log(e);
          }
        }
        console.log("collectible update:", collectibleUpdate);
        setYourLoogies(collectibleUpdate);
      }
      setLoadingLoogies(false);
    }
    updateAllLoogies();
  }, [addressTokenCount, connectedAddress, page, Boolean(contract)]);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <Image alt="Loogie" src="/loogie.svg" className="" width={192} height={192} />
        <p className="block text-4xl font-bold"> Your Loogies </p>
        <button
          onClick={async () => {
            try {
              await writeContractAsync({
                functionName: "mintItem",
                value: price,
              });
            } catch (e) {
              console.error(e);
            }
          }}
          className="btn btn-primary"
          disabled={!connectedAddress || !price}
        >
          Mint now for {price ? (+formatEther(price)).toFixed(6) : "-"} ETH
        </button>
        <p> You have {addressTokenCount || 0n} Loogies Minted </p>
      </div>

      <LoogiesDisplay
        loadingLoogies={loadingLoogies}
        allLoogies={yourLoogies}
        page={page}
        setPage={setPage}
        totalTokenCount={addressTokenCount}
        perPage={perPage}
      />
    </>
  );
};

export default YourLoogies;
