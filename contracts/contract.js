import { ethers } from "ethers";
import contractABI from "./PharmaSupply.json"; // <-- file .json bạn gửi sang

// 💡 Dán địa chỉ contract thật của bạn ở đây
const contractAddress = "0x608CcD56289578658c54f59CB44de31206CA139a";

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
