import React from "react";
import * as variants from "@/lib/motionVariants";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { AspectRatio } from "./ui/aspect-ratio";
import ReactPlayer from "react-player";

import { motion } from "motion/react";
import { overviewData } from "@/constants";
import { overviewBanner } from "@/assets";
import { Button } from "./ui/button";
import { Play } from "lucide-react";
const Overview = () => {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <motion.p
            variants={variants.fadeInUp}
            initial="start"
            whileInView="end"
            viewport={{ once: true }}
            className="section-subtitle dark text-sm font-medium uppercase"
          >
            {overviewData.sectionSubtitle}
          </motion.p>
          <motion.h2
            variants={variants.fadeInUp}
            initial="start"
            whileInView="end"
            viewport={{ once: true }}
            className="section-title dark:text-foreground text-3xl font-semibold leading-snug py-3 md:text-[40px]"
          >
            {overviewData.sectionTitle}
          </motion.h2>
          <motion.p
            variants={variants.fadeInUp}
            initial="start"
            whileInView="end"
            viewport={{ once: true }}
            className="section-text"
          >
            {overviewData.sectionText}
          </motion.p>
        </div>

        <div>
          <motion.div
            variants={variants.fadeInScale}
            initial="start"
            whileInView="end"
            viewport={{ once: true }}
            className="relative max-w-4xl mx-auto shadow-xl"
          >
            <figure>
              <img src={overviewBanner} alt="" width={900} height={601} />
            </figure>
            <Dialog>
              <DialogTrigger asChild>
               <Button
  variant="secondary"
  size="icon"
  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 bg-black/80 hover:bg-black/90 border-none shadow-lg"
>
  <div className="sr-only">play video</div>
  <Play fill="#fff" size={50} />
</Button>
              </DialogTrigger>
              <DialogContent className="p-0 overflow-hidden max-w-[640px] xl:max-w-[1000px]">
                <AspectRatio ratio={16 / 9}>
                  <ReactPlayer
                    src="https://www.youtube.com"
                    width="100%"
                    height="100%"
                    style={{ borderRadius: "12px" }}
                    controls
                  />
                </AspectRatio>
              </DialogContent>
            </Dialog>
          </motion.div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 gap-5 mt-8 md:mt-16 xl:grid-cols[3fr,2.5fr] xl:items-center">
            <motion.p
              variants={variants.fadeInRight}
              initial="start"
              whileInView="end"
              viewport={{ once: true }}
              className="section-title text-center lg:max-w-[30ch]  lg:mx-auto xl:text-left"
            >
              {overviewData.listTitle}
            </motion.p>
            <motion.div 
                variants={variants.staggerContainer}
            initial="start"
            whileInView="end"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-5 md:gap-10 xl:gap-8">
              {overviewData.list.map(({ title, text }, index) => (
                <motion.div 
                    variants={variants.fadeInLeft}
       
                className="text-center" key={index}>
                  <h3 className="text-3xl">{title}</h3>
                  <p className="text-sidebar-ring">{text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Overview;
