import styles from './loading.module.css'

export default function ArticleLoading() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="relative h-screen w-full mb-[4rem] md:mb-auto">
        <div className="w-full md:w-1/2 h-2/3 md:h-screen md:p-[2.05rem]">
          <div className="h-full w-full animate-pulse bg-neutral-200" />
        </div>

        <div className="md:absolute md:right-0 md:top-0 md:w-1/2 h-1/3 md:h-full flex flex-col items-center justify-center px-8 md:px-12">
          <div className={`${styles.fade} ${styles.d1} mb-6 h-4 w-28 rounded bg-neutral-200`} />
          <div className={`${styles.fade} ${styles.d2} mb-3 h-10 w-full max-w-md rounded bg-neutral-200`} />
          <div className={`${styles.fade} ${styles.d3} mb-3 h-10 w-full max-w-sm rounded bg-neutral-200`} />
          <div className={`${styles.fade} ${styles.d4} mt-6 h-4 w-44 rounded bg-neutral-100`} />
          <p className={`${styles.fade} ${styles.d5} mt-6 text-[11px] uppercase tracking-[0.25em] text-neutral-500`}>
            Chargement de l&apos;article
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 pb-16 md:px-10 lg:px-16">
        <div className="space-y-4">
          <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-10/12 animate-pulse rounded bg-neutral-100" />
        </div>
      </div>
    </div>
  )
}
