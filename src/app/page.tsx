import ImageLayout from '@/components/acf/ImageLayout'
import ContenuLayout from '@/components/acf/ContenuLayout'
import GuideVoyageLayout from '@/components/acf/GuideVoyageLayout'
import CarouselLayout from '@/components/acf/CarouselLayout'
import GuideLayout from '@/components/acf/GuideLayout'
import SliderLayout from '@/components/acf/SliderLayout'
import PortraitLayout from '@/components/acf/PortraitLayout'
import Footer from '@/components/footer/Footer'
import PostFooter from '@/components/footer/PostFooter'
import { getHomePage } from '@/lib/home'
import type { HomePageBloc } from '@/types/wordpress'

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
        />
      )
    case 'HomepageBlocsGuideLayout':
      return (
        <GuideLayout
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
    <div className="flex flex-col gap-24">
      {blocs.map((bloc, index) => (
        <section key={`${bloc.fieldGroupName}-${index}`} className="home-block">
          {renderBloc(bloc)}
        </section>
      ))}
      <PostFooter />
      <Footer />
    </div>
  )
}
