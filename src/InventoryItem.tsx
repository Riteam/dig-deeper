import style from './Inventory.module.css'

interface InventoryItemProps {
  count: number,
  img: string
}
function Inventory({ count, img }: InventoryItemProps) {
  return (
    <div className={style.item}>
      <img src={img} />
      <div className={style.count}>{count}</div>
    </div>
  )
}

export default Inventory