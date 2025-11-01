"use client";

import Image from "next/image";
import { Address } from "~~/components/scaffold-eth";

type Loogie = {
  id: bigint;
  uri: string;
  name: string;
  image: string;
  description: string;
  owner: string;
};

type LoogiesDisplayProps = {
  loadingLoogies: boolean;
  allLoogies: Loogie[] | undefined;
  page: bigint;
  setPage: (page: bigint) => void;
  totalSupply: bigint | undefined;
  perPage: bigint;
};

export const LoogiesDisplay = ({
  loadingLoogies,
  allLoogies,
  page,
  setPage,
  totalSupply,
  perPage,
}: LoogiesDisplayProps) => {
  return (
    <div className="flex-grow bg-base-300 w-full mt-4 p-8 flex justify-center items-center space-x-2">
      {loadingLoogies ? (
        <p className="">Loading...</p>
      ) : !allLoogies?.length ? (
        <p className="font-medium">No loogies minted</p>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-center">
            {allLoogies.map(loogie => {
              return (
                <div
                  key={loogie.id}
                  className="flex flex-col bg-base-100 p-5 text-center items-center max-w-xs rounded-3xl"
                >
                  <h2 className="">{loogie.name}</h2>
                  <Image src={loogie.image} alt={loogie.name} width={300} height={300} />
                  <p>{loogie.description}</p>
                  <Address address={loogie.owner} />
                </div>
              );
            })}
          </div>

          {/* page navigation */}
          <div className="flex justify-center mt-8 join">
            {page > 1n && (
              <button className="join-item btn" onClick={() => setPage(page - 1n)}>
                {" "}
                «{" "}
              </button>
            )}
            <button className="join-item btn btn-disabled"> Page {page.toString()} </button>
            {totalSupply !== undefined && totalSupply > page * perPage && (
              <button className="join-item btn" onClick={() => setPage(page + 1n)}>
                {" "}
                »{" "}
              </button>
            )}
          </div>
          {/* end of page navigation */}
        </div>
      )}
    </div>
  );
};
