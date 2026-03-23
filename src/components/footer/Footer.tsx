'use client'

import Image from 'next/image'
import Link from 'next/link'
import EditBanner from '@/components/admin/EditBanner'
import { useSiteChrome } from '@/components/providers/SiteChromeProvider'

interface FooterProps {
  postId?: string | number
}

export default function Footer({ postId }: FooterProps) {
  const { settings, footerMenu: menuItems } = useSiteChrome()
  return (
    <footer className="relative mt-10 overflow-hidden bg-black py-5 text-white after:absolute after:top-0 after:z-0 after:h-[80px] after:w-full after:bg-white">
      <div className="container mx-auto flex flex-col items-center justify-between gap-10 px-6 lg:flex-row">
        <div className="elementor-23971 flex flex-col space-y-2 pt-20 text-left text-sm uppercase">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id} className="transition pb-1 hover:italic font-montserrat">
                <Link href={item.path}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="my-5 flex flex-col items-center text-center">
          <h2 className="md:pt-10 text-[40pt] font-custom lg:pt-20 lg:text-[60pt]">
            {settings.title}
          </h2>
          <p className="mt-2 text-[8pt] uppercase font-montserrat">{settings.description}</p>
        </div>

        <div className="relative flex h-full flex-col items-center space-y-3 lg:items-end">
          <div className="h-[200px] md:h-[300px] w-44 lg:w-56 absolute -top-[80px] md:-top-[130px] md:right-[4rem]">
            <Image
              src="/images/image-30-1x-png@1x.png"
              alt="Nous"
              fill
              className="absolute left-0 z-10 object-contain"
              sizes="(min-width: 1024px) 15vw, 40vw"
            />
            {/* @JULIENPIPIER - left side */}
            <a
              href="https://www.julienpipier.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute -left-[130px] md:-left-[80px] top-[70px] md:top-[70px] z-20 flex flex-col items-center gap-1"
            >
              <svg className="w-10 h-10 md:w-12 md:h-12 rotate-[273deg] left-[56px] absolute top-[8px]" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 40 Q10 10 40 10" stroke="white" strokeWidth="1.5" fill="none" />
              </svg>
              <span className="text-[8px] md:text-[10px] font-montserrat uppercase tracking-wider">www.julienpipier.fr</span>
            </a>
            {/* @EMILIEEYCHENNE - right side */}
            <a
              href="https://www.instagram.com/emilieeychenne"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute -right-[140px] md:-right-[80px] bottom-[100px] md:bottom-[100px] z-20 flex flex-col items-center gap-1"
            >
              <span className="text-[8px] md:text-[10px] font-montserrat uppercase tracking-wider">@emilieeychenne</span>
              <svg className="w-10 h-10 md:w-12 md:h-12 rotate-[-271deg] absolute -left-[19px] -top-[52px]" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 40 Q10 10 40 10" stroke="white" strokeWidth="1.5" fill="none" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <EditBanner postId={postId} />
    </footer>
  )
}
