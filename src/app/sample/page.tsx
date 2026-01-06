import { redirect } from 'next/navigation'

// Redirect to real John Deere result
const SAMPLE_RESULT_ID = 'B6-u2LVQVO'

export default function SamplePage() {
  redirect(`/r/${SAMPLE_RESULT_ID}`)
}
