export default function ArticleLoading() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10 md:px-10 lg:px-16">
        <div className="mb-8 h-5 w-28 animate-pulse rounded bg-neutral-200" />
        <div className="mb-4 h-12 w-full max-w-3xl animate-pulse rounded bg-neutral-200" />
        <div className="mb-2 h-4 w-full max-w-xl animate-pulse rounded bg-neutral-100" />
        <div className="mb-10 h-4 w-full max-w-lg animate-pulse rounded bg-neutral-100" />

        <div className="mb-12 aspect-[16/9] w-full animate-pulse rounded-md bg-neutral-200" />

        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-10/12 animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-9/12 animate-pulse rounded bg-neutral-100" />
        </div>
      </div>
    </div>
  )
}
