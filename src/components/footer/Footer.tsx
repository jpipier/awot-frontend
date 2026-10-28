'use client'

import Image from 'next/image'
import Link from 'next/link'
import EditBanner from '@/components/admin/EditBanner'
import { useSiteChrome } from '@/components/providers/SiteChromeProvider'

interface FooterProps {
  postId?: string | number
  canEdit?: boolean
}

export default function Footer({ postId, canEdit = false }: FooterProps) {
  const { settings, footerMenu: menuItems } = useSiteChrome()
  return (
    <footer className="relative mt-10 overflow-hidden bg-black py-5 text-white after:absolute after:top-0 after:z-0 after:h-[80px] after:w-full md:after:bg-white h-[250px] md:h-auto">
      <div className="container mx-auto flex flex-col items-center gap-10 px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="elementor-23971 hidden md:flex flex-col space-y-2 pt-20 text-left text-sm uppercase">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id} className="transition pb-1 hover:italic font-montserrat">
                <Link href={item.path}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="my-5 flex flex-col items-center text-center">
          <h2 className="md:pt-10 lg:pt-20">
            <Image
              src="/images/salt-and-pine-white.svg"
              alt="Salt & Pine"
              width={160}
              height={66}
              className="h-auto w-40"
            />
          </h2>
          <p className="mt-2 text-[8pt] uppercase font-montserrat">{settings.description}</p>
        </div>

        <div className="relative flex h-full flex-col items-center space-y-3 lg:items-end lg:justify-self-end">
          <div className="h-[200px] md:h-[300px] w-44 lg:w-56 absolute -top-[30px] md:-top-[130px] md:right-[4rem]">
            <Image
              src="/images/image-30-1x-png@1x.png"
              alt="Nous"
              fill
              className="absolute left-0 z-10 object-contain"
              sizes="(min-width: 1024px) 15vw, 40vw"
            />
            {/* @JULIENPIPIER - left side */}
            <a
              href="https://julienpipier.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute -left-[130px] md:-left-[80px] top-[70px] md:top-[100px] z-20 flex flex-col items-center gap-1"
            >
              <svg className="w-10 h-10 md:w-12 md:h-12 rotate-[273deg] left-[115px] md:left-[56px] absolute -top-[40px] md:top-[20px]" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 40 Q10 10 40 10" stroke="white" strokeWidth="1.5" fill="none" />
              </svg>
              <span className="text-[8px] md:text-[10px] font-montserrat uppercase tracking-wider -top-[54px] md:top-0 absolute md:relative left-[50px] md:-left-[20px]">www.julienpipier.fr</span>
            </a>
            {/* @EMILIEEYCHENNE - right side */}
            <a
              href="https://www.instagram.com/emilieeychenne"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute -right-[140px] md:-right-[80px] bottom-[130px] md:bottom-[100px] z-20 flex flex-col items-center gap-1"
            >
              <span className="text-[8px] md:text-[10px] font-montserrat uppercase tracking-wider absolute md:static -left-[166px] -top-[15px]">@emilieeychenne</span>
              <svg className="w-10 h-10 md:w-12 md:h-12 rotate-[-289deg] md:rotate-[-271deg] absolute -left-[190px] md:-left-[19px] -top-[52px] md:-top-[52px]" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 40 Q10 10 40 10" stroke="white" strokeWidth="1.5" fill="none" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <EditBanner postId={postId} canEdit={canEdit} />
    </footer>
  )
}
