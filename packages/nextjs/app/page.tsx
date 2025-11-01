"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { LoogiesDisplay } from "~~/components/LoogiesDisplay";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: price } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "price",
  });
  const [loadingLoogies, setLoadingLoogies] = useState(true);
  const [allLoogies, setAllLoogies] = useState<any[]>();

  const [page, setPage] = useState(1n);
  const perPage = 12n;

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "totalSupply",
  });

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "YourCollectible" });

  const { data: contract } = useScaffoldContract({ contractName: "YourCollectible" });

  useEffect(() => {
    async function updateAllLoogies() {
      setLoadingLoogies(true);
      if (contract && totalSupply) {
        const collectibleUpdate = [];
        const offset = (page - 1n) * perPage;
        // displaying in descending order of indices
        const remainder = totalSupply - offset;
        const startIndex = remainder - 1n;
        const stopIndex = remainder > perPage ? startIndex - perPage : startIndex - remainder;
        for (let tokenIndex = startIndex; tokenIndex > stopIndex; tokenIndex--) {
          try {
            const tokenId = await contract.read.tokenByIndex([tokenIndex]);
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
        setAllLoogies(collectibleUpdate);
      }
      setLoadingLoogies(false);
    }
    updateAllLoogies();
  }, [totalSupply, page, Boolean(contract)]);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <Image alt="Loogie" src="/loogie.svg" className="" width={192} height={192} />
        <p className="block text-4xl font-bold"> Optimistic Loogies </p>
        <p className="block text-2xl mt-4 mb-2"> Loogies with a smile </p>
        <p>Only 3728 Optimistic Loogies available on a price curve increasing 0.2% with each new mint.</p>
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
        <p> {3728n - (totalSupply || 0n)} Loogies left </p>
      </div>

      {/* Loogies display */}
      <LoogiesDisplay
        loadingLoogies={loadingLoogies}
        allLoogies={allLoogies}
        page={page}
        setPage={setPage}
        totalSupply={totalSupply}
        perPage={perPage}
      />
      {/* end of loogies display */}
    </>
  );
};

export default Home;
