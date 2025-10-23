import React from "react";

import { heroData } from "@/constants";
import { Button } from "./ui/button";
import { heroBanner, heroBanner2 } from "@/assets";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { AspectRatio } from "./ui/aspect-ratio";
import ReactPlayer from "react-player";
import { CirclePlay } from "lucide-react";
import { motion, type Variants,useScroll,useSpring,useTransform } from "motion/react";
import { useRef } from "react";
import { Link } from "react-router";
const heroVariant: Variants = {
  start: {},
  end: {
    transition: {
      staggerChildren: 0.4,
    },
  },
};

const heroChildVariant: Variants = {
  start: {
    y: 30,
    opacity: 0,
    filter: "blur(5px)",
  },
  end: {
    y: 0,
    opacity: 1,
    filter: "blur(0)",
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};
const Hero = () => {

  const heroBannerRef=useRef<HTMLElement>(null);

  const {scrollYProgress}=useScroll({
    target:heroBannerRef,
    offset:['start 1080px', '50% start']
  });

  const scrollYTransform=useTransform(scrollYProgress,[0,1],[0.85,1.15]);

  const scale=useSpring(scrollYTransform,{
    stiffness:300,
    damping:30,
    restDelta:0.001
  });

  return (
    <section className="py-10 md:py-16">
      <motion.div
        variants={heroVariant}
        initial="start"
        animate="end"
        className="container text-center"
      >
        <div className="max-w-screen-md mx-auto">
          <motion.p
            variants={heroChildVariant}
            className="text-sm uppercase tracking-wider bg-secondary/50 text-secondary-foreground max-w-max
          mx-auto px-3 py-1 rounded-full border-t text-white/80 border-blue-500/10 text-whitebackdrop:blur-3xl mb-6 md:mb-10"
          >
            {heroData.sectionSubtitle}
          </motion.p>
          <motion.h2
            variants={heroChildVariant}
            className="text-4xl font-semibold !leading-tight mb-4 md:text-5xl md:mb-5 lg:text-6xl "
          >
            {heroData.sectionTitle}
          <span className="relative isolate ms-4">
  <span className="relative z-10">{heroData.decoTitle}</span>
  <span
    className="absolute z-0 inset-0 bg-foreground/5 rounded-full px-4 border-t border-foreground/20 shadow-[inset_0_0_30px_0px] pointer-events-none"
    aria-hidden="true"
    style={{
      boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.15)",
      backgroundColor: "rgba(255, 255, 255, 0.05)"
    }}
  ></span>
</span>

          </motion.h2>
          <motion.p
            variants={heroChildVariant}
            className="text-sidebar-ring md:text-xl"
          >
            {heroData.sectionText}
          </motion.p>
          <motion.div
            variants={heroChildVariant}
            className="flex justify-center gap-2 mt-6 md:mt-10"
          >
             <Link to="/sign-up">
            <Button className="bg-purple-700 hover:bg-purple-600 focus:bg-purple-600 text-white font-semibold">
              Start Free Trial
            </Button>
            </Link>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost">
                  <CirclePlay />
                  Watch Demo
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 overflow-hidden max-w-[640px] xl:max-w-[1000px]">
                <AspectRatio ratio={16 / 9}>
                  <ReactPlayer
                    src="https://www.youtube.com/"
                    width="100%"
                    height="100%"
                    style={{ borderRadius: "12px" }}
                    controls
                  />
                </AspectRatio>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>

        <div className="relative mt-12 mx-auto w-full max-w-2xl isolate rounded-xl md:mt-16">
          <motion.figure
            className="bg-background/60 border
           border-slate-800 backdrop-blur-3xl 
           rounded-xl shadow-2xl overflow-hidden w-full"
           initial={{
            y:120,
            opacity:0,
            filter:'blur(5px)'
           }}
           animate={{
            y:0,
            opacity:1,
            filter:'blur(0)',
           }}
           transition={{
            duration:1.5,
            delay:0.5,
            ease:'backInOut'
           }}
           ref={heroBannerRef}
           style={{scale}}
          >
            <img
              src={heroBanner2}
              alt="CustomLawFirm Dashboard"
              className="w-full h-auto"
            
            />
          </motion.figure>
          <motion.div
            className="absolute inset-0 rounded-xl -z-10"
            style={{
              background: "linear-gradient(180deg, #8b5cf6 40%, #1e293b 100%)",
              opacity: 0.5,
              filter: "blur(80px)",
            }}
            initial={{
                scale:0.8,
                opacity:0
            }}
            animate={{
              scale:1,
              opacity:1
            }}
            transition={{
              duration:2,
              delay:0.5,
            ease:'backInOut'
            }}
          ></motion.div>
          <motion.div
            className="absolute inset-0 rounded-xl -z-20"
            style={{
              background: "#3b82f6",
              opacity: 0.3,
              filter: "blur(160px)",
            }}
            initial={{
              scale:0.4,
              opacity:0
            }}
            animate={{
              scale:1,
              opacity:1
            }}
            transition={{
              duration:2,
              delay:1.5,
              ease:'backInOut'
            }}
          ></motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
