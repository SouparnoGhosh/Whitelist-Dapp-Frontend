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
  const [numOfWhiteListed, setNumOfWhiteListed] = useState(0);

  const web3ModalRef = useRef();

  // used to get a Web3 provider or signer
  const getProviderOrSigner = async (needSigner = false) => {
    const provider: providers.ExternalProvider =
      // @ts-ignore
      await web3ModalRef.current.connect();
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

  //add the address to the whitelist
  const addAddressToWhiteList = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whiteListContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const txn = await whiteListContract.addAddressToWhitelist();
      setLoading(true);
      await txn.wait();
      setLoading(false);
      await getNumberOfWhitelisted();
      setJoinedWhiteList(true);
    } catch (err) {
      console.error(err);
    }
  };

  // get the number of addresses in the whitelist
  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();
      // @ts-ignore
      const whiteListContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _numAddressesWhitelisted =
        await whiteListContract.numAddressesWhitelisted();
      setNumOfWhiteListed(_numAddressesWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  // check if address is in whitelist
  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      // @ts-ignore
      const _address = await signer.getAddress();
      const whiteListContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const _joinedWhiteList = await whiteListContract.whitelistedAddresses(
        _address
      );
      setJoinedWhiteList(_joinedWhiteList);
    } catch (err) {
      console.error(err);
    }
  };

  // connect to Metamask Wallet
  const connectWallet = async () => {
    try {
      await getProviderOrSigner(true);
      setWalletConnected(true);
      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  // render the button
  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhiteList) {
        return <div className={styles.description}>Thanks for joining</div>;
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button className={styles.button} onClick={addAddressToWhiteList}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      return (
        <button className={styles.button} onClick={connectWallet}>
          Connect Wallet
        </button>
      );
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      // @ts-ignore
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletConnected]);

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
          {renderButton()}
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
