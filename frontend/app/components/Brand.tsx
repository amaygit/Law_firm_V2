import React from 'react';
import { brands } from '@/assets';
import { motion } from 'motion/react';
import * as variants from '@/lib/motionVariants'
const Brand = () => {
  return (
    <section className="section">
      <div className="container max-w-screen-lg">
        <motion.p variants={variants.fadeInUp} 
            initial='start'
           
            whileInView='end'
            viewport={{once:true}}
        className="text-center mb-4 md:mb-6">
          Powering data insights for today's startup and tommorow's leader.
        </motion.p>
        <motion.div 
        variants={variants.staggerContainer} 
            initial='start'
          
            whileInView='end'
            viewport={{once:true}}
        className="flex justify-center flex-wrap gap-5 md:gap-10">
          {brands.map((brand, index) => (
            <motion.figure 
            variants={variants.fadeInUp}        
             key={index} className="flex items-center justify-center">
              <img
                src={brand}
                alt=""
                className="opacity-60 w-24 h-auto md:w-28" // Small fixed width with auto height
              />
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Brand;
