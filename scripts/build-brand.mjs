import { readFile, writeFile } from 'node:fs/promises'
import { Resvg } from '@resvg/resvg-js'
const icon = await readFile('public/wealthscale.svg', 'utf8')
for (const size of [32, 180]) {
  const image = new Resvg(icon, { fitTo: { mode: 'width', value: size } })
    .render()
    .asPng()
  await writeFile(
    `public/${size === 180 ? 'apple-touch-icon' : `favicon-${size}`}.png`,
    image,
  )
}
const preview = await readFile('public/social-card.svg', 'utf8')
await writeFile('public/social-card.png', new Resvg(preview).render().asPng())
console.log('Generated favicon sizes, touch icon, and social preview.')
