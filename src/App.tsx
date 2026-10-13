import { lazy, Suspense, useState } from 'react'
import type { ReactElement } from 'react'
import { Journey } from '@/features/journey/Journey'
import { DEFAULT_REFERENCE } from '@/features/comparison/reference'
const Explorer = lazy(() =>
  import('@/features/explorer/Explorer').then((module) => ({
    default: module.Explorer,
  })),
)
export default function App(): ReactElement {
  const [exploring, setExploring] = useState(false)
  const [returned, setReturned] = useState(false)
  const [reference, setReference] = useState(DEFAULT_REFERENCE)
  if (exploring)
    return (
      <Suspense
        fallback={
          <div className="journey-loading" role="status">
            Opening the wealth atlas…
          </div>
        }
      >
        <Explorer
          reference={reference}
          onReferenceChange={setReference}
          onBack={() => {
            setExploring(false)
            setReturned(true)
          }}
        />
      </Suspense>
    )
  return (
    <Journey
      referenceInput={reference}
      onReferenceChange={setReference}
      initialStep={returned ? 5 : 0}
      onOpenWorlds={() => setExploring(true)}
    />
  )
}
