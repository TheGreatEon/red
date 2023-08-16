import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import Stake from "./stake";

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <Stake/>
  );
};

export default Home;
