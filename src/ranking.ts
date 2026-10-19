type SearchResult = {
  name: string;
  similarity: number;
};

const results: SearchResult[] = [
  { name: "Iron Sword", similarity: 0.32 },
  { name: "Healing Potion", similarity: 0.81 },
  { name: "Medical Herbs", similarity: 0.69 },
];

// TODO:
// 使用 Array.sort() 将 results 按 similarity 降序排列
results.sort((a, b) => b.similarity - a.similarity);

console.log(results);
