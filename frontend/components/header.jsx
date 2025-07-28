import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Header = () => {
  return (
    <header className='container mx-auto'>
        <nav className='py-5 px-4 flex justify-between items-center'>
            <Link href={"/"}>
                <Image
                src={"/travai_logo.png"}
                alt='Trav AI logo'
                width={60}
                height={60}
                className='h-10 w-auto object-contain'
                />
            </Link>
        </nav>
    </header>
  )
}

export default Header