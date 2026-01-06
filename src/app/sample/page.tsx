import Link from 'next/link'

// Temporary placeholder until we have a real Caterpillar scan
export default function SamplePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-section text-3xl text-[var(--foreground)]">Sample report coming soon</h1>
        <p className="text-body text-lg">
          Run the test on your own site to see an example report.
        </p>
        <div className="pt-2">
          <Link href="/" className="btn-kinetic inline-flex">
            Test your website
          </Link>
        </div>
      </div>
    </main>
  )
}
