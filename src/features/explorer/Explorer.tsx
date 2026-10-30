import { QualitySelect } from '@/features/shared/QualitySelect'
import { ComparisonInsight } from '@/features/comparison/ComparisonInsight'
import { lazy, Suspense, useState, useMemo, useRef, useCallback } from 'react'
import type { ReactElement, KeyboardEvent } from 'react'
import { ArrowLeft, Download, RotateCcw, ArrowUpRight } from 'lucide-react'
import { useWealthSnapshot } from '@/features/journey/useWealthSnapshot'
import { useWealthHistory } from '@/api/useWealthHistory'
import { historyMonth } from '@/api/history'
import { ReferenceInput } from '@/features/comparison/ReferenceInput'
import { referenceValue } from '@/features/comparison/reference'
import type { Reference } from '@/features/comparison/reference'
import { money } from '@/features/journey/scale'
import { WORLDS } from './worlds'
import type { World } from './worlds'
import type { Quality } from '@/scene/lab/policy'
import { useCapture } from '@/features/shared/useCapture'
import { WealthGame } from './WealthGame'
import './explorer.css'
const WorldStage = lazy(() => import('./WorldStage'))
export function Explorer({
  reference,
  onReferenceChange,
  onBack,
}: {
  reference: Reference
  onReferenceChange: (value: Reference) => void
  onBack: () => void
}): ReactElement {
  const [world, setWorld] = useState<World>('cosmos')
  const [selected, setSelected] = useState('')
  const [month, setMonth] = useState<string | null>(null)
  const [illustrated, setIllustrated] = useState(false)
  const [quality, setQuality] = useState<Quality>('standard')
  const [reset, setReset] = useState(0)
  const [game, setGame] = useState(false)
  const gameTrigger = useRef<HTMLButtonElement>(null)
  const snapshot = useWealthSnapshot()
  const history = useWealthHistory(world === 'timeline')
  const currentMonth = month ?? history.data?.months.at(-1) ?? ''
  const people = useMemo(
    () =>
      world === 'timeline'
        ? history.data
          ? historyMonth(history.data, currentMonth)
          : []
        : (snapshot.data?.people ?? []),
    [world, history.data, currentMonth, snapshot.data],
  )
  const historicalChoices = useMemo(
    () => [
      ...new Map(
        Object.values(history.data?.snapshots ?? {})
          .flat()
          .map((person) => [person.uri, person]),
      ).values(),
    ],
    [history.data],
  )
  const choices = world === 'timeline' ? historicalChoices : people
  const chosen =
    choices.find((person) => person.uri === selected) ?? people[0] ?? choices[0]
  const selectMonth = (value: string | null): void => {
    // Keep the displayed default fortune when another month has a new leader.
    if (chosen) setSelected(chosen.uri)
    setMonth(value)
  }
  const target =
    world === 'timeline' && chosen
      ? {
          ...chosen,
          dollars:
            people.find((person) => person.uri === chosen.uri)?.dollars ?? 0,
        }
      : chosen
  const targetUri = target?.uri
  const showIllustrated = useCallback(() => setIllustrated(true), [])
  const timeline = useMemo(() => {
    if (world !== 'timeline' || !history.data || !targetUri) return null
    return history.data.months
      .map((date) => ({
        date,
        person: historyMonth(history.data, date).find(
          (person) => person.uri === targetUri,
        ),
      }))
      .filter((entry) => entry.date <= currentMonth)
      .slice(-12)
  }, [world, history.data, currentMonth, targetUri])
  const chart = timeline
    ? timeline.map((entry) => ({
        uri: entry.date,
        name: entry.date,
        dollars: entry.person?.dollars,
      }))
    : people
  const amount = referenceValue(reference)
  const sourceDate =
    world === 'timeline' ? currentMonth : (snapshot.data?.asOf ?? '')
  const description = WORLDS.find((entry) => entry.id === world) ?? WORLDS[0]
  const maximum =
    world === 'timeline' && history.data
      ? Math.max(
          1,
          ...Object.values(history.data.snapshots)
            .flat()
            .map((person) => person.dollars),
        )
      : Math.max(1, ...people.map((person) => person.dollars))
  const activeQuery = world === 'timeline' ? history : snapshot
  const captureTitle = `${description.name} · ${target?.name ?? 'Wealth estimates'}${target ? ` · ${target.dollars ? money(target.dollars) : 'No observation'}` : ''}`
  const captureInfo = useMemo(
    () => ({
      title: captureTitle,
      legend: description.legend,
      source: `Forbes via RTB-API · As of ${sourceDate}`,
    }),
    [description.legend, captureTitle, sourceDate],
  )
  const { capture, registerCapture, saving, message, save } = useCapture()
  const keyboardTab = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ): void => {
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % 4
        : event.key === 'ArrowLeft'
          ? (index + 3) % 4
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? 3
              : null
    if (next === null) return
    event.preventDefault()
    setWorld(WORLDS[next].id)
    document.getElementById(`world-tab-${WORLDS[next].id}`)?.focus()
  }
  return (
    <div className="journey-app">
      <header className="journey-header">
        <button
          className="journey-brand"
          onClick={(event) => {
            event.preventDefault()
            onBack()
          }}
        >
          <img src="/wealthscale.svg" alt="" width={32} height={32} />
          Wealth<span>Scale</span>
        </button>
        <button className="text-button" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to scale lab
        </button>
      </header>
      <main>
        <div className="explorer-heading">
          <div>
            <span className="eyebrow">THE WEALTH ATLAS</span>
            <h1>
              One world. <em>Different perspectives.</em>
            </h1>
          </div>
          <button
            ref={gameTrigger}
            className="primary-button"
            disabled={!snapshot.data?.people.length}
            onClick={() => setGame(true)}
          >
            Guess the fortune <ArrowUpRight size={16} />
          </button>
        </div>
        <div
          className="world-tabs"
          role="tablist"
          aria-label="Visualization modes"
        >
          {WORLDS.map((entry, index) => (
            <button
              id={`world-tab-${entry.id}`}
              key={entry.id}
              role="tab"
              aria-label={entry.name}
              aria-selected={world === entry.id}
              aria-controls="world-panel"
              tabIndex={world === entry.id ? 0 : -1}
              onClick={() => setWorld(entry.id)}
              onKeyDown={(event) => keyboardTab(event, index)}
            >
              <span>0{index + 1}</span>
              {entry.name}
            </button>
          ))}
        </div>
        <div className="explorer-layout">
          <section
            id="world-panel"
            role="tabpanel"
            aria-labelledby={`world-tab-${world}`}
            className={`world-exhibit world-${world}`}
          >
            <div className="world-caption">
              <div>
                <span className="small-label">
                  {world === 'timeline'
                    ? currentMonth || 'MONTHLY HISTORY'
                    : 'TOP TEN · ESTIMATED NET WORTH'}
                </span>
                <h2>{description.description}</h2>
              </div>
              <button
                className="view-toggle"
                aria-pressed={illustrated}
                onClick={() => setIllustrated(!illustrated)}
              >
                {illustrated ? 'Use 3D view' : 'Use illustrated view'}
              </button>
            </div>
            {world === 'timeline' && history.data && (
              <div className="history-controls">
                <label htmlFor="history-month">Travel through time</label>
                <select
                  id="history-month"
                  value={currentMonth}
                  onChange={(event) => selectMonth(event.target.value)}
                >
                  {history.data.months.map((date) => (
                    <option key={date}>{date}</option>
                  ))}
                </select>
                <input
                  aria-label="History month"
                  type="range"
                  min={0}
                  max={Math.max(0, history.data.months.length - 1)}
                  value={Math.max(0, history.data.months.indexOf(currentMonth))}
                  onChange={(event) =>
                    selectMonth(
                      history.data?.months[Number(event.target.value)] ?? null,
                    )
                  }
                />
              </div>
            )}
            <div className="world-viewport">
              {activeQuery.isPending ? (
                <div className="stage-fallback" role="status">
                  Loading dated estimates…
                </div>
              ) : activeQuery.isError ? (
                <div className="stage-fallback" role="alert">
                  <p>
                    We couldn’t load these estimates. You can still explore
                    benchmark scales.
                  </p>
                  <button onClick={() => void activeQuery.refetch()}>
                    Retry data
                  </button>
                  <button onClick={onBack}>Return to scale lab</button>
                </div>
              ) : !people.length ||
                (timeline && !timeline.some((entry) => entry.person)) ? (
                <div className="stage-fallback">
                  <p>
                    {world === 'timeline'
                      ? 'No observations for this month or selected trail. Missing data does not mean zero wealth.'
                      : 'No dated wealth estimates are available.'}
                  </p>
                </div>
              ) : illustrated ? (
                <div className="world-chart" aria-label="Net worth comparison">
                  {chart.map((person) => (
                    <button
                      key={person.uri}
                      aria-pressed={
                        timeline
                          ? currentMonth === person.uri
                          : target?.uri === person.uri
                      }
                      onClick={() =>
                        timeline
                          ? selectMonth(person.uri)
                          : setSelected(person.uri)
                      }
                    >
                      <span>{person.name}</span>
                      <span className="chart-track">
                        <span
                          style={{
                            width: `${((person.dollars ?? 0) / maximum) * 100}%`,
                          }}
                        />
                      </span>
                      <strong>
                        {person.dollars === undefined
                          ? 'No observation'
                          : money(person.dollars)}
                      </strong>
                    </button>
                  ))}
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="stage-fallback">Preparing the world…</div>
                  }
                >
                  <WorldStage
                    world={world}
                    timeline={timeline}
                    people={people}
                    selected={target?.uri ?? ''}
                    onSelect={world === 'timeline' ? selectMonth : setSelected}
                    maximum={maximum}
                    reset={reset}
                    quality={quality}
                    onFallback={showIllustrated}
                    onCapture={registerCapture}
                    captureInfo={captureInfo}
                  />
                </Suspense>
              )}
            </div>
            {timeline && (
              <p className="world-legend">
                {target?.name}: the last 12 months through {currentMonth}.
                Missing months leave gaps; use the date selector to travel.
              </p>
            )}
            <ol className="world-key" aria-label="Objects in the scene">
              {(timeline
                ? timeline.map((entry) => ({
                    uri: entry.date,
                    name: entry.date,
                    dollars: entry.person?.dollars,
                  }))
                : people
              ).map((person, index) => (
                <li key={person.uri}>
                  <button
                    onClick={() =>
                      timeline
                        ? selectMonth(person.uri)
                        : setSelected(person.uri)
                    }
                    aria-pressed={!timeline && target?.uri === person.uri}
                  >
                    <span>{index + 1}.</span> {person.name}
                    {timeline &&
                      ` · ${person.dollars === undefined ? 'no observation' : money(person.dollars)}`}
                  </button>
                </li>
              ))}
            </ol>
            <div className="world-tools">
              <span>
                {illustrated
                  ? 'Choose a row to inspect'
                  : 'Drag / two fingers to orbit · scroll the page · +/− to zoom'}
              </span>
              <button
                className="icon-button"
                onClick={() => setReset((value) => value + 1)}
                aria-label="Reset world view"
              >
                <RotateCcw size={16} />
              </button>
            </div>
            <p className="world-legend">
              {illustrated
                ? 'Bar length = net worth on the same linear scale.'
                : description.legend}
            </p>
            <p className="source-note">
              {sourceDate ? `Estimates as of ${sourceDate}. ` : ''}
              <a
                href="https://github.com/komed3/rtb-api"
                target="_blank"
                rel="noreferrer"
              >
                Forbes via RTB-API <ArrowUpRight size={11} />
              </a>
              {world === 'timeline'
                ? ' Each month shows that month’s top ten, not a fixed cohort.'
                : ''}
            </p>
          </section>
          <aside
            style={{ visibility: game ? 'hidden' : 'visible' }}
            className="world-inspector"
            aria-label="Wealth inspector"
          >
            <span className="small-label">LOOK A LITTLE CLOSER</span>
            <label htmlFor="inspect-person">Choose a fortune</label>
            <select
              id="inspect-person"
              disabled={!choices.length}
              value={target?.uri ?? ''}
              onChange={(event) => setSelected(event.target.value)}
            >
              {!choices.length && (
                <option value="">No estimates available</option>
              )}
              {choices.map((person) => (
                <option value={person.uri} key={person.uri}>
                  {person.name}
                </option>
              ))}
            </select>
            {target && (
              <div className="person-summary">
                <h2>{target.name}</h2>
                <strong>
                  {target.dollars ? money(target.dollars) : 'No observation'}
                </strong>
                <p>
                  {target.source
                    ? `Source of wealth: ${target.source}`
                    : `Industry: ${target.industry}`}
                </p>
                <p className="input-help">
                  Net worth includes assets and debt. It is not annual income or
                  cash in a bank.
                </p>
              </div>
            )}
            <ReferenceInput
              reference={reference}
              onChange={onReferenceChange}
            />
            <ComparisonInsight
              amount={amount}
              kind={reference.kind}
              target={target?.dollars}
            />
            <div className="render-options">
              <QualitySelect value={quality} onChange={setQuality} />
            </div>
            <button
              className="save-button"
              disabled={!capture || illustrated || saving || !people.length}
              onClick={() => void save()}
            >
              <Download size={16} />
              {saving ? 'Saving…' : 'Save this perspective'}
            </button>
            <p role="status" className="input-help">
              {message ||
                'A branded image, saved locally. No personal amount is included.'}
            </p>
          </aside>
        </div>
      </main>
      <footer className="journey-footer">
        <span>Explore slowly. Think big.</span>
        <span>All values in USD. No account. No uploads.</span>
      </footer>
      {game && snapshot.data && (
        <WealthGame
          people={snapshot.data.people}
          asOf={snapshot.data.asOf}
          onClose={() => {
            setGame(false)
            queueMicrotask(() => gameTrigger.current?.focus())
          }}
        />
      )}
    </div>
  )
}
