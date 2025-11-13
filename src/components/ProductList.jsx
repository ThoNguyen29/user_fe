import React, { useEffect, useState } from "react";
import { getBlockchainContract } from "../../contracts/contract";
import ProductCard from "../components/ProductCard";

export default function ProductList() {
  const [drugs, setDrugs] = useState([]);

  useEffect(() => {
    const loadDrugs = async () => {
      const contract = await getBlockchainContract();
      if (!contract) return;

      const total = await contract.totalDrugs();
      let list = [];

      for (let i = 0; i < total; i++) {
        const drug = await contract.drugs(i);
        list.push({
          id: i,
          name: drug.name,
          description: drug.description,
          price: Number(drug.price),
          rating: 4.5,
        });
      }

      setDrugs(list);
    };

    loadDrugs();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {drugs.map((d) => (
        <ProductCard key={d.id} product={d} />
      ))}
    </div>
  );
}
