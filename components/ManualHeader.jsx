import { useMoralis } from "react-moralis";
import { useEffect } from "react";
export default function ManualHeader() {
    const {
        enableWeb3,
        deactivateWeb3,
        account,
        isWeb3Enabled,
        Moralis,
        isWeb3EnableLoading,
    } = useMoralis();

    //useEffect, simply put, is setup with a function, and an array of dependencies.
    //each time a dependency changes, the function stated in the useEffect method will be called, and re-render the front end accordingly.
    //useEffect will auto run on load, and then it will run checking the value.
    //if we do not give useEffect NO dependency array ie useEffect(someFunc), it will run anytime something re-renders
    //thus we should be careful with this cause it can result in recursion or circular re-renders.
    //if we give useEffect a BLANK dependency array, it will run once on load
    useEffect(() => {
        if (isWeb3Enabled) return;

        if (typeof window !== "undefined") {
            if (window.localStorage.getItem("connected")) {
                enableWeb3();
            }
        }
    }, [isWeb3Enabled]);

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed to ${account}`);
            if (account == null) {
                if (typeof window !== "undefined") {
                    window.localStorage.removeItem("connected");
                    deactivateWeb3();
                    console.log("Null account found");
                }
            }
        });
    }, []);

    return (
        <div>
            {account ? (
                <div>
                    Connected to {account.slice(0, 6)}...
                    {account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3();
                        //add a key-value to local storage for smoother app functionality with connecting then refreshing.
                        if (typeof window !== "undefined") {
                            window.localStorage.setItem(
                                "connected",
                                "injected"
                            );
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    );
}
