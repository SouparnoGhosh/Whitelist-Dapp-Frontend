import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { Contract, providers } from "ethers";
import Web3Modal from "web3modal";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";
import { useState, useRef, useEffect } from "react";

const Home: NextPage = () => {
  // states and ref
  const [walletConnected, setWalletConnected] = useState(false);
  const [joinedWhiteList, setJoinedWhiteList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numOfWhiteListed, setNumOfWhiteListed] = useState(1);

  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    // @ts-ignore
    const provider: providers.ExternalProvider = web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }
    if (needSigner) {
      const web3Signer = web3Provider.getSigner();
      return web3Signer;
    }
    return web3Provider;
  };

  // the page structure
  return (
    <div>
      <Head>
        <title>Whitelist DApp</title>
        <meta name="description" content="Whitelisted address DApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Whitelist Dapp!</h1>
          <div className={styles.description}>
            Its adds addresses to a whitelist.
          </div>
          <div className={styles.description}>
            {numOfWhiteListed === 0 ? (
              <div>Join ASAP. Limited spaces available.</div>
            ) : (
              <div>
                {numOfWhiteListed} {numOfWhiteListed === 1 ? "has" : "have"}{" "}
                joined the whitelist.
              </div>
            )}
          </div>
          {/* {renderButton()} */}
        </div>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image
            alt="Crypto Devs"
            className={styles.image}
            src="/sushi.jpg"
            width="100"
            height="100"
          />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
};

export default Home;
