export { searchGameItems } from "./rag"; //重新导出，让调用者可以统一从 tools.ts 引入工具

export function getPlayerState() {
  return {
    hp: 20,
    maxHp: 100,
  };
}

export function getInventory() {
  return {
    items: [
      { name: "Healing Potion", quantity: 1 },
      { name: "Iron Sword", quantity: 1 },
    ],
  };
}
