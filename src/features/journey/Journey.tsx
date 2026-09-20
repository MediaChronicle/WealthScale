import { ComparisonInsight } from '@/features/comparison/ComparisonInsight'
import { useReducer, useState, useRef, useEffect } from 'react'
import type { ReactElement } from 'react'
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  MoveUpRight,
} from 'lucide-react'
import { ScaleExhibit } from './ScaleExhibit'
import { ReferenceInput } from '@/features/comparison/ReferenceInput'
import {
  DEFAULT_REFERENCE,
  referenceValue,
} from '@/features/comparison/reference'
import type { Reference } from '@/features/comparison/reference'
import { useWealthSnapshot } from './useWealthSnapshot'
import {
  INITIAL_JOURNEY,
  journeyReducer,
  money,
  number,
  scaleUnit,
} from './scale'

const CHAPTERS = [
  {
    name: 'Your reference',
    title: (
      <>
        Big numbers.
        <br />
        <em>Made tangible.</em>
      </>
    ),
    description:
      'We hear \u201cbillion\u201d all the time. But how big is it, really? Start with something familiar. Then change your sense of scale.',
  },
  {
    name: 'A million',
    title: (
      <>
        First, meet
        <br />
        <em>a million.</em>
      </>
    ),
    description:
      'This is one million dollars. Keep this block in mind. In the next step, it becomes the smallest piece of a much bigger picture.',
  },
  {
    name: 'A billion',
    title: (
      <>
        A billion changes
        <br />
        <em>the perspective.</em>
      </>
    ),
    description:
      'Same dollars. Three more zeros. Before we build a billion, take a guess: how many million-dollar blocks will we need?',
  },
  {
    name: 'A real fortune',
    title: (
      <>
        Behind the number,
        <br />
        <em>a real fortune.</em>
      </>
    ),
    description:
      'An estimated fortune, translated into value blocks. Net worth includes assets\u2014it is not cash in a bank or an annual salary.',
  },
  {
    name: 'A trillion',
    title: (
      <>
        One more leap.
        <br />
        <em>A trillion.</em>
      </>
    ),
    description:
      'A thousand billions. A million millions. This is a hypothetical benchmark, not a claim about anyone\u2019s fortune.',
  },
  {
    name: 'Explore',
    title: (
      <>
        Now, make it
        <br />
        <em>personal.</em>
      </>
    ),
    description:
      'Pick a benchmark or a real fortune. Change your reference and see the exact difference, at your own pace.',
  },
]

export function Journey({
  onOpenWorlds,
  referenceInput,
  onReferenceChange,
  initialStep,
}: {
  referenceInput: Reference
  onReferenceChange: (value: Reference) => void
  initialStep: number
  onOpenWorlds: () => void
}): ReactElement {
  const [journey, dispatch] = useReducer(journeyReducer, {
    ...INITIAL_JOURNEY,
    step: initialStep,
  })
  const kind = referenceInput.kind
  const [selected, setSelected] = useState('')
  const [benchmark, setBenchmark] = useState(1e9)
  const [cameraReset, setCameraReset] = useState(0)
  const [replay, setReplay] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(journey.step)
  const snapshot = useWealthSnapshot(
    journey.step === 2 || journey.step === 3 || journey.step === 5,
  )
  const people = snapshot.data?.people ?? []
  const person = people.find((entry) => entry.uri === selected) ?? people[0]
  const inputValue = referenceValue(referenceInput)
  const validAmount = inputValue !== null
  const reference = inputValue ?? 100000
  const step = journey.step
  const target = [
    reference,
    1e6,
    1e9,
    person?.dollars ?? 1e9,
    1e12,
    selected && person ? person.dollars : benchmark,
  ][step]
  const unit = step === 0 ? reference : scaleUnit(target)
  const predicted = journey.prediction !== null
  const isLive = (step === 3 || (step === 5 && !!selected)) && !!person
  const next = (): void => {
    dispatch({ type: 'next' })
    setCameraReset((value) => value + 1)
  }
  const reset = (): void => {
    dispatch({ type: 'reset' })
    setReplay((value) => value + 1)
    onReferenceChange(DEFAULT_REFERENCE)
    setSelected('')
    setBenchmark(1e9)
    setCameraReset((value) => value + 1)
  }
  useEffect(() => {
    if (previousStep.current !== step) {
      heading.current?.focus()
      previousStep.current = step
    }
  }, [step])

  return (
    <div className="journey-app">
      <a className="journey-skip" href="#journey-content">
        Skip to the lesson
      </a>
      <header className="journey-header">
        <button
          className="journey-brand"
          onClick={(event) => {
            event.preventDefault()
            reset()
          }}
          aria-label="WealthScale home"
        >
          <img src="/wealthscale.svg" alt="" width="32" height="32" />
          Wealth<span>Scale</span>
          <span className="brand-edition">AN EXPERIMENT IN PERSPECTIVE</span>
        </button>
        <div className="header-actions">
          <button
            className="text-button"
            onClick={() => dispatch({ type: 'explore' })}
          >
            Skip to explore <ArrowUpRight size={15} />
          </button>
          <button
            className="icon-button"
            onClick={reset}
            aria-label="Restart journey"
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </header>

      <main id="journey-content" className={`journey-main chapter-${step}`}>
        <div className="lesson-column">
          <section className="journey-copy" aria-labelledby="lesson-heading">
            <div className="eyebrow">
              <span className="status-dot" /> THE SCALE OF WEALTH{' '}
              <span className="chapter-count">
                {String(step + 1).padStart(2, '0')} / 06
              </span>
            </div>
            <h1 id="lesson-heading" ref={heading} tabIndex={-1}>
              {CHAPTERS[step].title}
            </h1>
            <p className="lesson-description">
              {step === 3 && !person
                ? snapshot.isPending
                  ? 'Loading a dated fortune. The billion-dollar benchmark stays visible while the estimate arrives.'
                  : 'No dated fortune is available yet. This is an illustrative billion-dollar benchmark, not an estimate of anyone’s wealth.'
                : CHAPTERS[step].description}
            </p>
          </section>
          <section
            className="journey-controls"
            aria-label="Your comparison and journey controls"
          >
            {(step === 0 || step === 5) && (
              <ReferenceInput
                reference={referenceInput}
                onChange={onReferenceChange}
              />
            )}
            {step === 2 && (
              <div className="prediction">
                <span className="small-label">MAKE A PREDICTION</span>
                <div className="prediction-options">
                  {[10, 100, 1000].map((value) => (
                    <button
                      key={value}
                      aria-pressed={journey.prediction === value}
                      onClick={() => {
                        dispatch({ type: 'predict', value })
                        if (window.innerWidth <= 700)
                          document
                            .querySelector('.stage-viewport')
                            ?.scrollIntoView({
                              block: 'center',
                              behavior: 'instant',
                            })
                      }}
                    >
                      {number(value)} blocks
                    </button>
                  ))}
                </div>
                {predicted && (
                  <p role="status" className="prediction-result">
                    {journey.prediction === 1000
                      ? 'Exactly. '
                      : 'Bigger than it seems: '}
                    <strong>1,000 millions make a billion.</strong> Ten wide,
                    ten deep, ten tall.
                  </p>
                )}
              </div>
            )}

            {(step === 3 || step === 5) && (
              <div className="fortune-picker">
                {step === 5 && (
                  <>
                    <label htmlFor="benchmark">Choose your scale</label>
                    <select
                      id="benchmark"
                      value={selected ? 'person' : String(benchmark)}
                      onChange={(event) => {
                        if (event.target.value === 'person')
                          setSelected(people[0]?.uri ?? '')
                        else {
                          setSelected('')
                          setBenchmark(Number(event.target.value))
                        }
                      }}
                    >
                      <option value="1000000">$1 million</option>
                      <option value="1000000000">$1 billion</option>
                      <option value="1000000000000">
                        $1 trillion · hypothetical
                      </option>
                      {people.length > 0 && (
                        <option value="person">A real fortune</option>
                      )}
                    </select>
                  </>
                )}
                {(step === 3 || selected) && people.length > 0 && (
                  <>
                    <label htmlFor="fortune">Estimated net worth</label>
                    <select
                      id="fortune"
                      value={person?.uri ?? ''}
                      onChange={(event) => setSelected(event.target.value)}
                    >
                      {people.map((entry) => (
                        <option key={entry.uri} value={entry.uri}>
                          {entry.name} · {money(entry.dollars)}
                        </option>
                      ))}
                    </select>
                  </>
                )}
                {snapshot.isPending && (
                  <p className="input-help">
                    Loading dated estimates. Benchmarks remain available.
                  </p>
                )}
                {(snapshot.isError ||
                  (!snapshot.isPending && !people.length)) && (
                  <p className="input-help">
                    Live estimates unavailable. Showing an illustrative
                    benchmark.{' '}
                    <button
                      className="inline-link"
                      onClick={() => void snapshot.refetch()}
                    >
                      Retry data
                    </button>
                  </p>
                )}
              </div>
            )}

            {step > 0 && (
              <ComparisonInsight
                amount={inputValue}
                kind={kind}
                target={target}
              />
            )}

            <div className="lesson-actions">
              {step > 0 && (
                <button
                  className="back-button"
                  onClick={() => dispatch({ type: 'back' })}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              {step < 5 ? (
                <button
                  className="primary-button"
                  disabled={!validAmount || (step === 2 && !predicted)}
                  onClick={next}
                >
                  {step === 0
                    ? 'Let’s feel the scale'
                    : step === 4
                      ? 'Explore your own scale'
                      : 'Keep going'}
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button className="primary-button" onClick={reset}>
                  Replay the journey
                  <RotateCcw size={17} />
                </button>
              )}
            </div>
            {step === 0 && (
              <p className="duration-note">
                Six small steps. One very different perspective.
              </p>
            )}
          </section>
        </div>
        <ScaleExhibit
          key={replay}
          step={step}
          target={target}
          unit={unit}
          predicted={predicted}
          reference={inputValue}
          referenceKind={kind}
          personName={isLive ? person?.name : undefined}
          asOf={isLive ? snapshot.data?.asOf : undefined}
          resetToken={cameraReset}
        />
      </main>

      <nav className="chapter-nav" aria-label="Journey chapters">
        {CHAPTERS.map((chapter, index) => (
          <button
            key={chapter.name}
            aria-label={`${String(index + 1).padStart(2, '0')} ${chapter.name}`}
            onClick={() => dispatch({ type: 'go', step: index })}
            aria-current={step === index ? 'step' : undefined}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <span>{chapter.name}</span>
            {index === step && <MoveUpRight size={15} />}
          </button>
        ))}
      </nav>
      <footer className="journey-footer">
        <span>A little perspective goes a long way.</span>
        <button onClick={onOpenWorlds}>
          Explore four worlds <ArrowUpRight size={13} />
        </button>
        <span>Built for curiosity. All values in USD.</span>
      </footer>
    </div>
  )
}
