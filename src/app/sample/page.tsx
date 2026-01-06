import { redirect } from 'next/navigation'

// Redirect to a real Caterpillar result
// To update: run a scan of caterpillar.com, grab the result ID from /r/[id], update below
const SAMPLE_RESULT_ID = 'PLACEHOLDER'

export default function SamplePage() {
  redirect(`/r/${SAMPLE_RESULT_ID}`)
}
