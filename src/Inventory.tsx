import style from './Inventory.module.css'
// import Config from './assets/js/config'
import InventoryItem from './InventoryItem'
interface InventoryProps {
  items: number[]
}

// const { Ores } = Config
function Inventory({ items }: InventoryProps) {
  return <div className={style.Inventory}>
    {items.map((_, i) => (
      <InventoryItem
        key={i}
        type={i}
        count={items[i]}
      ></InventoryItem>
    ))}
  </div >
}

export default Inventory