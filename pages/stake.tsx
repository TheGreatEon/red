import {
  ConnectWallet,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useContractRead,
  useOwnedNFTs,
  useTokenBalance,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import NFTCard from "../components/NFTCard";
import {
  nftDropContractAddress,
  stakingContractAddress,
  tokenContractAddress,
} from "../consts/contractAddresses";
import styles from "../styles/Home.module.css";
import redlogo from '../styles/REDLOGO.png'
import { supabase } from "./sbc";
import Popup from 'reactjs-popup'

const Stake: NextPage = () => {
  const address = useAddress();
  const { contract: nftDropContract } = useContract(
    nftDropContractAddress,
    "nft-drop"
  );
  const { contract: tokenContract } = useContract(
    tokenContractAddress,
    "token"
  );
  const { contract, isLoading } = useContract(stakingContractAddress);
  const { data: ownedNfts } = useOwnedNFTs(nftDropContract, address);
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();
  const [stakedItems, setStakedItems] = useState<any>();
  const { data: stakedTokens } = useContractRead(contract, "getStakeInfo", [
    address,
  ]);
  // const stakedTokens2 = stakedTokens
  // const finalStakedTokens = stakedTokens2[0].concat(stakedTokens[0])
  // console.log('finalstaked tokens', finalStakedTokens)
  useEffect(() => {
    if (!contract || !address) return;

    async function loadClaimableRewards() {
      const stakeInfo = await contract?.call("getStakeInfo", [address]);
      setClaimableRewards(stakeInfo[1]);
    getData()
    }
    

    loadClaimableRewards();
  }, [address, contract]);

  async function getData() {
    try {  
      let { data: stakers, error } = await supabase
        .from('stakers')
        .select('*')
      if (error) throw error;
      var finalStakers:any = {}
      if (stakers != null) {
        for (let stake in stakers) {
          finalStakers[stakers[stake]['id']] = stakers[stake]
        }
        setStakedItems(finalStakers);
        console.log("data", stakedItems)
      }
      
    }
    catch (error) {
      console.log(error)
    }
  }

  async function sampleTest(id:any, type:any) {
    try {  
      let { data, error } = await supabase
        .from('stakers')
        .upsert(
          {
            id: parseInt(id),
            date: Date.now(),
            type: type,
            wallet: address
          }
        )
      if (error) throw error;
      if (data != null) {
        console.log(data)
        }
      }
      
    catch (error) {
      console.log(error)
    }
  }
  async function stakeNft(id: string) {
    if (!address) return;

    const isApproved = await nftDropContract?.isApproved(
      address,
      stakingContractAddress
    );
    if (!isApproved) {
      await nftDropContract?.setApprovalForAll(stakingContractAddress, true);
    }
    
    try {  
      let { data, error } = await supabase
        .from('stakers')
        .upsert(
          {
            id: parseInt(id),
            date: Date.now(),
            type: 1,
            wallet: address
          }
        )
      if (error) throw error;
      console.log("doneeeeeeeeeeee")
      await contract?.call("stake", [[id]]);
      }
      
    catch (error) {
      console.log(error)
    }

  }

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <div className={styles.container}>
      
      <div style={{display:'flex'}}>
        <div>
          <button className={styles.header_button}>WEBSITE</button>
          <button className={styles.header_button}>TRAIT RANDOMIZER</button>
        </div>
        <img style={{width:'120px'}} src={redlogo.src} />
        <div>
          <button className={styles.header_button}>DOCUMENTATION</button>
        </div>
        <div style={{marginTop:'20px', width:'230px', height:'40px'}}>
          <ConnectWallet theme="light"/>
        </div>
      </div>
      
      {!address ? (
        <></>
      ) : (
        <>
        <div style={{display:'flex'}}>
          <div className={styles.header_label}>
            <div><label style={{fontWeight:'bold'}}>$RED PER DAY</label></div>
            <label>x $RED</label>
          </div>
          <div className={styles.header_label}>
            <div><label style={{fontWeight:'bold', padding:'10px'}}>AMOUNT STAKED</label></div>
            <label>{stakedTokens? stakedTokens[0].length: 0} NFTs STAKED</label>
          </div><div className={styles.header_label}>
            <div><label style={{fontWeight:'bold'}}>REWARDS</label></div>
            <label><b>
                  {!claimableRewards
                    ? "Loading..."
                    : ethers.utils.formatUnits(claimableRewards, 18)}
                </b> $RED</label>
          </div>
        </div>
        <div style={{display:'flex'}}>
        <div className={styles.header_nft}>
            <h1 style={{fontWeight:'bold', fontSize:'18px'}}>WALLET</h1>
            <hr className={`${styles.divider} ${styles.spacerTop}`}/>
            <div className={styles.cardgrid}>
              {ownedNfts?.map((nft) => (
                <div className={styles.column} key={nft.metadata.id}>
                  <ThirdwebNftMedia
                    metadata={nft.metadata}
                    width="160px"
                    height="160px"
                    className={styles.nftMedia}
                  />
                  <label style={{marginTop:'10px', marginBottom:'-10px', fontSize:'10px'}}>{nft.metadata.name}</label>
                  <Popup
                      trigger={<button className={styles.stakebutton}>STAKE</button>}
                      modal
                      >
                        <div className={styles.column} style={{background:'white'}}>    
                        <label style={{marginTop:'10px', marginBottom:'-10px', fontSize:'10px', fontWeight:'bold'}}>Locked Duraton</label>       
                         <hr className={`${styles.divider} ${styles.spacerTop}`}/>
                         <div style={{display:'flex'}}>
                          <button className={styles.stakebutton} onClick={() => stakeNft(nft.metadata.id)}>30 days</button>
                          <button className={styles.stakebutton} onClick={() => stakeNft(nft.metadata.id)}>30 days</button>
                          </div>
                          <ThirdwebNftMedia
                            metadata={nft.metadata}
                            width="160px"
                            height="160px"
                            className={styles.nftMedia}
                          />
                          <label style={{marginTop:'10px', marginBottom:'10px', fontSize:'10px'}}>{nft.metadata.name}</label>
                          
                        </div>
                      </Popup>
                </div>
              ))}
              </div>
            </div>
        <div className={styles.header_nft}>
          <h1 style={{fontWeight:'bold', fontSize:'18px'}}>STAKED</h1>
          <hr className={`${styles.divider} ${styles.spacerTop}`} />
            <div className={styles.cardgrid}>
              {stakedTokens &&
                stakedTokens[0]?.map((stakedToken: BigNumber) => (
                  <div key={stakedToken.toString()}>
                  <NFTCard
                    tokenId={stakedToken.toNumber()}
                    detailss={stakedItems? stakedItems: []}
                    key={stakedToken.toString()}
                  />
                  
                  </div>
                ))}
            </div>
          </div>
            </div>
          {/* <h2>Your Tokens</h2>
          <div className={styles.tokenGrid}>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Claimable Rewards</h3>
              <p className={styles.tokenValue}>
                <b>
                  {!claimableRewards
                    ? "Loading..."
                    : ethers.utils.formatUnits(claimableRewards, 18)}
                </b>{" "}
                {tokenBalance?.symbol}
              </p>
            </div>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Current Balance</h3>
              <p className={styles.tokenValue}>
                <b>{tokenBalance?.displayValue}</b> {tokenBalance?.symbol}
              </p>
            </div>
          </div> */}

          <Web3Button
            action={(contract) => contract.call("claimRewards")}
            contractAddress={stakingContractAddress}
          >
            Claim Rewards
          </Web3Button>
        </>
      )}
      {/* <button onClick={() => sampleTest('12', 3)}>
                    sample button
      </button> */}
    </div>
  );
};

export default Stake;
