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
              <li key={item.id} className="transition hover:underline lato-light">
                <Link href={item.path}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="my-5 flex flex-col items-center text-center">
          <h2 className="pt-10 text-[40pt] font-custom lg:pt-20 lg:text-[60pt]">
            {settings.title}
          </h2>
          <p className="mt-2 text-[8pt] uppercase lato-light">{settings.description}</p>
        </div>

        <div className="relative flex h-full flex-col items-center space-y-3 lg:items-end">
          <div className="h-[300px] w-44 lg:w-56 absolute -top-[130px]">
            <Image
              src="/images/image-30-1x-png@1x.png"
              alt="Nous"
              fill
              className="absolute left-0 z-10 object-contain"
              sizes="(min-width: 1024px) 15vw, 40vw"
            />
          </div>
          <div className="relative w-44 lg:w-56">
            <p className="absolute left-[-10rem] text-xs italic">C’EST NOUS !</p>
          </div>
          <div className="mt-2 flex space-x-3">
            <Image src="/images/trac--6@1x.png" alt="Instagram" width={20} height={20} />
            <Image src="/images/trac--7@1x.png" alt="Email" width={20} height={20} />
          </div>
        </div>
      </div>
      <EditBanner postId={postId} />
    </footer>
  )
}
