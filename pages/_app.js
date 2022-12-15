import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";

function MyApp({ Component, pageProps }) {
    return (
        //adding initializeOnMount can be used to hook into a specific server for more functionality, but we dont care/need to so setting to false.
        <MoralisProvider initializeOnMount={false}>
            <NotificationProvider>
                <Component {...pageProps} />
            </NotificationProvider>
        </MoralisProvider>
    );
}

export default MyApp;
