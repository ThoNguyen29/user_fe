import { ethers } from "ethers";
import contractABI from "./PharmaSupply.json"; // <-- file .json bạn gửi sang

// 💡 Dán địa chỉ contract thật của bạn ở đây
const contractAddress = "0x9F069170F197f0200a523d36773F5d7791e55095";

export const getBlockchainContract = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask first!");
    return null;
  }

  // Yêu cầu quyền truy cập MetaMask
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Tạo kết nối tới contract
  const contract = new ethers.Contract(
    contractAddress,
    contractABI.abi,
    signer
  );
  return contract;
};
