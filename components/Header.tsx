"use client";

import Link from 'next/link';
import React from 'react'

function Header() {
  return (
    <header className='sticky top-0 z-50 left-0 right-0'>
        <div>
            {/* left */}
            <div>
                <Link href="/">
                <h1>AgentTube</h1>
                </Link>
            </div>
            {/* right */}
            <div></div>
        </div>
    </header>
  )
}

export default Header