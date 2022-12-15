import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
    //at the top of our app everything is wrapped in the MoralisProvider.
    //When we initialize with our wallet in the Header, it passes up all that data to the Moralis Provider
    //allowing us to pull numerous data points from our connected web3 wallet.
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
    const chainId = parseInt(chainIdHex);
    const raffleAddress =
        chainId in contractAddresses ? contractAddresses[chainId][0] : null;

    const [entranceFee, setEntranceFee] = useState("0");
    const [numberOfPlayers, setNumberOfPlayers] = useState("0");
    const [recentWinner, setRecentWinner] = useState("0");

    //Commented out below is first attempt at setting up listeners for emits/events on the chain.
    //right now its firing off out of control, and the setRecentWinner() being called isnt helping.
    //probably need to isolate where/how this provider.on is being setup.

    // if (raffleAddress && typeof window !== "undefined") {
    //     console.log(raffleAddress);
    //     const provider = new ethers.providers.Web3Provider(window.ethereum);

    //     console.log(raffleAddress);

    //     const winEvent = new ethers.Contract(raffleAddress, abi, provider);

    //     const winDetected = winEvent.filters.WinnerPicked();
    //     console.log(winDetected);
    //     provider.on(winDetected, (winnerPicked) => {
    //         console.log("WinnerFound!!!!");
    //         setRecentWinner(winnerPicked.topics[1].toString());
    //     });
    // }

    const dispatch = useNotification();

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getEntranceFee",
        params: {},
    });

    const {
        runContractFunction: enterRaffle,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    });

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    });

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    });

    //cant do a straight await in useEffect, but we can write an async function and call await within that as a work around.
    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString();
        const numberOfPlayersCall = (await getNumberOfPlayers()).toString();
        const recentWinnerCall = (await getRecentWinner()).toString();

        setEntranceFee(entranceFeeFromCall);
        setNumberOfPlayers(numberOfPlayersCall);
        setRecentWinner(recentWinnerCall);
    }

    const handleSuccess = async function (tx) {
        await tx.wait(1);
        handleNewNotification(tx);
        updateUI();
    };

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        });
    };

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    return (
        <div>
            Enter the lottery now!
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-blue-100 font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                //these functions come equipped with lots of events
                                //onSuccess does not actually check if the blockchain transaction as went through
                                //it just confirms that we are done with metamask or the wallet essentially
                                //which is why in the handleSuccess we do the tx.wait(1)
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            });
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full" />
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <span> </span>
                    Fee:<span> </span>
                    {ethers.utils.formatUnits(entranceFee, "ether")} ETH{" "}
                    <br></br>
                    Number of Players: {numberOfPlayers}
                    <br></br>
                    Recent Winner : {recentWinner}
                </div>
            ) : (
                <div>No Raffle Address Detected</div>
            )}
        </div>
    );
}
