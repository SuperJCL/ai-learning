function dotProduct(a: number[], b: number[]): number {
  // TODO:
  // 将两个向量对应位置的数字相乘，然后求和
  // 可以假设两个数组的长度相等
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

// console.log(dotProduct([1, 2], [3, 4]));
// Expected output: 11

function magnitude(vector: number[]): number {
  // TODO:
  // 1. 将每个分量平方
  // 2. 将所有平方结果求和
  // 3. 使用 Math.sqrt() 计算平方根
  let sumOfSquares = 0;
  for (let i = 0; i < vector.length; i++) {
    sumOfSquares += vector[i] * vector[i];
  }
  return Math.sqrt(sumOfSquares);
}

// console.log(magnitude([3, 4]));
// Expected output: 5

export function cosineSimilarity(a: number[], b: number[]): number {
  // TODO:
  // 1. 计算点积
  // 2. 计算两个向量长度的乘积
  // 3. 用点积除以长度乘积
  const dotProd = dotProduct(a, b);
  const magA = magnitude(a);
  const magB = magnitude(b);
  return dotProd / (magA * magB);
}

// console.log(cosineSimilarity([1, 0], [1, 0]));
// Expected: 1

// console.log(cosineSimilarity([1, 0], [0, 1]));
// Expected: 0
