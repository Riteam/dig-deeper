
import redstone from '../img/redstone.png'
import copper from '../img/copper.png'
import gold from '../img/gold.png'
import emerald from '../img/emerald.png'
import diamond from '../img/diamond.png'
import lazuli from "../img/lazuli.png"
import amethyst from "../img/amethyst.png"

import TNT from "../img/TNT.png"

const Ores = [redstone, copper, gold, emerald, diamond, lazuli, amethyst]

const Wonders = [
  TNT,
]
const Size = 8

const Variety = Ores.length

export default { Size, Ores, Variety, Wonders }