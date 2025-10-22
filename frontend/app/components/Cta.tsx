import React, { useRef, useState } from "react";
import * as variants from "@/lib/motionVariants";
import { motion } from "motion/react";
import { ctaData } from "@/constants";
import { Button } from "./ui/button";
import { Link } from "react-router";
import emailjs from "@emailjs/browser";

const Cta = () => {
  const form = useRef(null);
  const [result, setResult] = useState("");

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setResult("Sending...");

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID!,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID!,
        form.current!,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY!
      )
      .then(
        () => {
          setResult("Message Sent!");
          if (form.current) (form.current as HTMLFormElement).reset();
        },
        (error) => {
          setResult("Send failed: " + error.text);
          console.error(error);
        }
      );
  };

  return (
    <section className="section">
      <div className="container">
        <motion.div
          variants={variants.fadeInUp}
          initial="start"
          whileInView="end"
          viewport={{ once: true }}
          className="bg-primary rounded-xl border-t border-primary-foreground/30 overflow-hidden grid grid-cols-1 lg:grid-cols-2 lg:items-center"
        >
          <div className="p-8 md:p-16 xl:p-20">
            <motion.h2
              variants={variants.fadeIn}
              initial="start"
              whileInView="end"
              viewport={{ once: true }}
              className="text-[26px] leading-tight font-semibold mb-6 capitalize sm:text-[34px] md:text-[46px] lg:mb-10"
            >
              {ctaData.text}
            </motion.h2>
            <motion.div
              variants={variants.fadeIn}
              initial="start"
              whileInView="end"
              viewport={{ once: true }}
              className="flex items-center gap-3 lg:gap-4 mb-6"
            >
              <Link to="/sign-up">
                <Button className="bg-purple-700 hover:bg-purple-600 focus:bg-purple-600 text-white">
                  Free Trial
                </Button>
              </Link>
              <Button variant="ghost" className="border-current hover:black/20">
                Pricing & Plans
              </Button>
            </motion.div>
          </div>
          <div className="p-8 md:p-16 xl:p-20 flex items-center justify-center">
            {/* Contact Form */}
            <form
              ref={form}
              onSubmit={sendEmail}
              className="flex flex-col gap-3 w-full max-w-md"
              autoComplete="off"
            >
              <input
                type="text"
                name="user_name"
                placeholder="Your Name"
                className="rounded px-3 py-2 bg-zinc-900 border border-zinc-600 text-white"
                required
              />
              <input
                type="email"
                name="user_email"
                placeholder="Your Email"
                className="rounded px-3 py-2 bg-zinc-900 border border-zinc-600 text-white"
                required
              />
              <textarea
                name="message"
                placeholder="Your Message"
                rows={4}
                className="rounded px-3 py-2 bg-zinc-900 border border-zinc-600 text-white"
                required
              />
              <Button
                type="submit"
                className="bg-purple-700 hover:bg-purple-600 text-white font-semibold mt-2"
              >
                Send
              </Button>
              {result && (
                <span className="mt-2 text-sm text-white">{result}</span>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Cta;
