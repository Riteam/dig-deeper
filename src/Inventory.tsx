import style from './Inventory.module.css'
import { Ores } from './assets/js/config'
import InventoryItem from './InventoryItem'

interface InventoryProps {
  items: number[]
}
function Inventory({ items }: InventoryProps) {
  return <div className={style.Inventory}>
    {items.map((_, i) => (
      <InventoryItem
        count={items[i]}
        img={Ores[i]}
        key={Ores[i]}
      ></InventoryItem>
    ))}
  </div >
}

export default Inventory