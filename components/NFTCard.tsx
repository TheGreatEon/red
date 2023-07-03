import {
  ThirdwebNftMedia,
  useContract,
  useNFT,
  Web3Button,
} from "@thirdweb-dev/react";
import type { FC } from "react";
import {
  nftDropContractAddress,
  tokenContractAddress,
  stakingContractAddress,
} from "../consts/contractAddresses";
import styles from "../styles/Home.module.css";
import Popup from "reactjs-popup";
//import { Int } from "@terra-money/terra.js";
interface NFTCardProps {
  tokenId: number;
}
import { SupabaseClient, createClient } from "@supabase/supabase-js";

const supabaseURL = 'https://klsfvrucjxgjujhimoiy.supabase.co';
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsc2Z2cnVjanhnanVqaGltb2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODc0MTQ2NjAsImV4cCI6MjAwMjk5MDY2MH0.Hi1WOmZM0xBiZZvz_iQKDRpW1lHNinPc7mtrPaTP1L8';

const supabase = createClient(supabaseURL, supabaseAnonKey);

const NFTCard: FC<any> = ({ tokenId, detailss }) => {
  const { contract } = useContract(nftDropContractAddress, "nft-drop");
  const { contract: tokenContract } = useContract(
    tokenContractAddress,
    "token"
  );
  const { data: nft } = useNFT(contract, tokenId);
  const stakedDetails = detailss[tokenId]
  // async function unstake(id:string) {
  //   await contract?.call("withdraw", [[id]]);
  // }

  async function handleTime(id:any) {
    console.log(id)
    try {
      const dataT = await tokenContract?.call("transfer", ["0xf352a11724b996546a52001e53fD106c98626566", 1000000000]);
      if (dataT) {
        console.log('data', dataT)
        let { data, error } = await supabase
        .from('stakers')
        .upsert(
          {
            id: id,
            date: Date.now()-10000000000,
            type: 0,
            wallet: stakedDetails['wallet']
          }
        )
      }
    }  
    catch (error){
      alert("error");
    }
  }
  return (
    <>
      {nft && (
        <div className={styles.column}>
          {nft.metadata && (
            <ThirdwebNftMedia
              metadata={nft.metadata}
              width="160px"
              height="160px"
              className={styles.nftMedia}
            />
          )}
          <label style={{marginTop:'10px', marginBottom:'-10px', fontSize:'10px'}}>{nft.metadata.name}</label>
          {/* <button className={styles.stakebutton} onClick={() => contract?.call("withdraw", [[nft.metadata.id]])}>UNSTAKE</button> */}
          {stakedDetails && stakedDetails['date']+1000*60*60*1*stakedDetails['type']>Date.now()? <button className={styles.stakebutton} onClick={() => handleTime(tokenId)}>Unlock</button>: 
          <Popup
            trigger={<button className={styles.stakebutton}>UNSTAKE</button>}
            modal
            >
              <div className={styles.column} style={{background:'white'}}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  width="160px"
                  height="160px"
                  className={styles.nftMedia}
                />
                <label style={{marginTop:'10px', marginBottom:'10px', fontSize:'10px'}}>{nft.metadata.name}</label>
                <div style={{display:'flex', padding:'2px', margin:'2px'}}>
                  <Web3Button
                    theme="dark"
                    action={(contract) => contract?.call("withdraw", [[nft.metadata.id]])}
                    contractAddress={stakingContractAddress}
                  >
                    Unstake
                </Web3Button>
                </div>
              </div>
            </Popup>
}
        </div>
      )}
    </>
  );
};
export default NFTCard;
