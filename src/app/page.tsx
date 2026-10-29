import type { Metadata } from 'next'
import ImageLayout from '@/components/acf/ImageLayout'
import ContenuLayout from '@/components/acf/ContenuLayout'
import GuideVoyageLayout from '@/components/acf/GuideVoyageLayout'
import CarouselLayout from '@/components/acf/CarouselLayout'
import GuideLayout from '@/components/acf/GuideLayout'
import SliderLayout from '@/components/acf/SliderLayout'
import PortraitLayout from '@/components/acf/PortraitLayout'
import WorkWithUsLayout from '@/components/acf/WorkWithUsLayout'
import Footer from '@/components/footer/Footer'
import PostFooter from '@/components/footer/PostFooter'
import InstagramFeed from '@/components/social/InstagramFeed'
import { getHomePage } from '@/lib/home'
import type { HomePageBloc } from '@/types/wordpress'
import { getYoastMetadataForWpPath, mergeMetadataWithFallback } from '@/lib/seo'
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site-config'

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: { absolute: `${SITE_NAME} : guide des Landes et du Pays Basque` },
    description: SITE_DESCRIPTION,
    alternates: {
      canonical: '/'
    }
  }

  const yoastMetadata = await getYoastMetadataForWpPath('/')
  return mergeMetadataWithFallback(yoastMetadata, fallback)
}

function slugifyId(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function getBlocSectionId(bloc: HomePageBloc): string | undefined {
  if ('titreDeLaSection' in bloc) {
    const title = bloc.titreDeLaSection

    if (typeof title === 'string') {
      const normalized = slugifyId(title.trim())

      if (normalized) {
        return normalized
      }
    }
    else{
      return 'section-' + slugifyId(bloc.fieldGroupName)
    }
  }
  else if ('titre' in bloc) {
    const title = bloc.titre

    if (typeof title === 'string') {
      const normalized = slugifyId(title.trim())

      if (normalized) {
        return normalized
      }
    }
    else{
      return 'section-' + slugifyId(bloc.fieldGroupName)
    }
  }
  else{
    return 'section-' + slugifyId(bloc.fieldGroupName)
  }

  return undefined
}

function renderBloc(bloc: HomePageBloc) {
  switch (bloc.fieldGroupName) {
    case 'HomepageBlocsImageLayout':
      return <ImageLayout image={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsImageLayout' }>).image} />
    case 'HomepageBlocsContenuLayout':
      return (
        <ContenuLayout
          contenu={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsContenuLayout' }>).contenu}
        />
      )
    case 'HomepageBlocsGuideVoyageLayout':
      return (
        <GuideVoyageLayout
          titreDeLaSection={
            (bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsGuideVoyageLayout' }>).titreDeLaSection
          }
          categorie={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsGuideVoyageLayout' }>).categorie}
          lien={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsGuideVoyageLayout' }>).lien}
          postParPage={(
            bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsGuideVoyageLayout' }>
          ).postParPage}
        />
      )
    case 'HomepageBlocsCarouselLayout':
      return (
        <CarouselLayout
          titreDeLaSection={
            (bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsCarouselLayout' }>).titreDeLaSection
          }
          headline={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsCarouselLayout' }>).headline}
          contenu={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsCarouselLayout' }>).contenu}
          categorie={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsCarouselLayout' }>).categorie}
          postParPage={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsCarouselLayout' }>).postParPage}
          lien={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsCarouselLayout' }>).lien}
        />
      )
    case 'HomepageBlocsGuideLayout':
      return (
        <GuideLayout
          titreDeLaSection="Carousel Guide"
          categorie={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsGuideLayout' }>).categorie}
          lien={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsGuideLayout' }>).lien}
        />
      )
    case 'HomepageBlocsSliderLayout':
      return <SliderLayout slider={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsSliderLayout' }>).slider} />
    case 'HomepageBlocsPortraitLayout':
      return (
        <PortraitLayout
          titreDeLaSection={
            (bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsPortraitLayout' }>).titreDeLaSection
          }
          categorie={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsPortraitLayout' }>).categorie}
          postParPage={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsPortraitLayout' }>).postParPage}
          contenu={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsPortraitLayout' }>).contenu}
          lien={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsPortraitLayout' }>).lien}
        />
      )
    case 'HomepageBlocsWorkWithUsLayout':
      return (
        <WorkWithUsLayout
          image={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsWorkWithUsLayout' }>).image}
          titre={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsWorkWithUsLayout' }>).titre}
          contenu={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsWorkWithUsLayout' }>).contenu}
          bouton={(bloc as Extract<HomePageBloc, { fieldGroupName: 'HomepageBlocsWorkWithUsLayout' }>).bouton}
        />
      )
    default:
      return null
  }
}

export default async function HomePage() {
  const page = await getHomePage()
  const blocs = page?.template?.homepage?.blocs ?? []

  return (
    <div className="flex flex-col">
      {blocs.map((bloc, index) => {
        const sectionId = getBlocSectionId(bloc)

        return (
          <section key={`${bloc.fieldGroupName}-${index}`} id={sectionId} className="home-block bg-white z-99">
            {renderBloc(bloc)}
          </section>
        )
      })}
      <InstagramFeed limit={10} usernameOverride="guide.landes.paysbasque" />
      <Footer />
    </div>
  )
}
