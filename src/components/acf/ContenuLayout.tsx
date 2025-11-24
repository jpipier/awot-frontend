interface ContenuLayoutProps {
  contenu?: string | null
}

export default function ContenuLayout({ contenu }: ContenuLayoutProps) {
  if (!contenu) {
    return null
  }

  return (
    <section
      className="contentElementor font-montserrat mx-auto max-w-4xl px-6 py-10"
      dangerouslySetInnerHTML={{ __html: contenu }}
    />
  )
}
