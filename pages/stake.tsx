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

import Popup from 'reactjs-popup'
import { SupabaseClient, createClient } from "@supabase/supabase-js";

const supabaseURL = 'https://klsfvrucjxgjujhimoiy.supabase.co';
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsc2Z2cnVjanhnanVqaGltb2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODc0MTQ2NjAsImV4cCI6MjAwMjk5MDY2MH0.Hi1WOmZM0xBiZZvz_iQKDRpW1lHNinPc7mtrPaTP1L8';

const supabase = createClient(supabaseURL, supabaseAnonKey);

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
  const [days, setDays] = useState(-1);
  const [stakedItems, setStakedItems] = useState<any>();
  const [loading, setLoading] = useState(false);
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
  function handledaychange30(){
    setDays(-1)
  }
  function handledaychange60(){
    setDays(1)
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
    setLoading(true)
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
    setLoading(false)

  }

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <div className={styles.container}>
     
      <div style={{ flexDirection: 'column', alignItems: 'center' }}>
        <button className={styles.header_button}>WEBSITE</button>
        <button className={styles.header_button}>TRAIT RANDOMIZER</button>
        <img src={redlogo.src} alt="Logo" className={styles.logo} />
        <button className={styles.header_button}>DOCUMENTATION</button>
        <ConnectWallet theme="light" />
      </div>
      
      {!address ? (
        <></>
      ) : (
        <>
        <div>            
            <button className={styles.header_label}><div style={{fontWeight:'bold'}}>$RED PER DAY</div> <div>x $RED</div></button>          
            <button className={styles.header_label} ><div style={{fontWeight:'bold'}}>AMOUNT STAKED</div> <div>{stakedTokens ? stakedTokens[0].length : 0} NFTs</div></button>
            <button className={styles.header_label}><div style={{fontWeight:'bold'}}>REWARDS</div><b>
                {!claimableRewards
                  ? "Loading..."
                  : parseFloat(ethers.utils.formatUnits(claimableRewards, 18)).toFixed(2)}
                  </b> $RED
            </button>
              
            
          </div> 
              
        <div className={styles.partgrid}>
        <div className={styles.header_nft}>
            <h1 style={{fontWeight:'bold', fontSize:'18px'}}>WALLET</h1>
            <hr className={`${styles.divider} ${styles.spacerTop}`}/>
            <div className={styles.cardgrid}>
              {ownedNfts?.map((nft) => (
                <div className={styles.column} key={nft.metadata.id}>
                  <ThirdwebNftMedia
                    metadata={nft.metadata}
                    width="130px"
                    height="130px"
                    className={styles.nftMedia}
                  />
                  <label style={{marginTop:'10px',  fontSize:'10px'}}>{nft.metadata.name}</label>
                  <Popup
                      trigger={<button className={styles.stakebutton}>STAKE</button>}
                      modal
                      >
                        <div className={styles.stakingpop} style={{background:'white'}}>    
                        <label style={{marginTop:'10px',  fontSize:'10px', fontWeight:'bold'}}>Locked Duraton</label>       
                         <hr className={`${styles.divider} ${styles.spacerTop}`}/>
                         <div style={{display:'flex'}}>
                          <button className={styles.stakebutton} onClick={() => handledaychange30()}>30 days</button>
                          <button className={styles.stakebutton} onClick={() => handledaychange60()}>60 days</button>
                          </div>
                          <ThirdwebNftMedia
                            metadata={nft.metadata}
                            width="130px"
                            height="130px"
                            className={styles.nftMedia}
                          />
                          <label style={{marginTop:'10px', marginBottom:'10px', fontSize:'10px'}}>{nft.metadata.name}</label>
                          {days<0 ? <button disabled={loading} className={styles.stakebutton} onClick={() => stakeNft(nft.metadata.id)}>{loading? 'Loading': 'Confirm'}</button>
                            :
                            <button disabled={loading} className={styles.stakebutton} onClick={() => stakeNft(nft.metadata.id)}>{loading? 'Loading': 'Confirm'}</button>
                            }
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

          <Web3Button
            action={(contract) => contract?.call("claimRewards")}
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
