import React from 'react'
import { favicon,logo,logo1,favicon1 } from '@/assets'
type LogoProps = {
    variant?:'default'| 'icon';
}


const Logo = ({variant='default'}:LogoProps) => {
  return (
    <a
    href=''
    className=""   
     
      >
        {variant === 'default' && (
            <img src={logo1} alt="saajna logo" 
            width={150}
            height={31}
            />
        )}

         {variant === 'icon' && (
            <img src={favicon1} alt="saajna logo" 
            width={32}
            height={31}
            />
        )}
    </a>
  )
}

export default Logo