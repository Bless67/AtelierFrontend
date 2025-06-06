import React from "react";
import { motion } from "framer-motion";
import NavBar from "../Layout/NavBar"; // Adjust path as needed

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const About = () => {
  return (
    <>
      <NavBar showSearchbtn={true} />

      <motion.div
        className="bg-white text-gray-800 px-4 sm:px-6 lg:px-12 py-12 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        <motion.h1
          className="text-3xl sm:text-4xl font-bold mb-6 text-center"
          variants={fadeUp}
        >
          About Yabuwat Atelier
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg mb-4 text-center font-medium text-pink-600"
          variants={fadeUp}
          custom={1}
        >
          Where Style Meets Story
        </motion.p>

        <motion.p
          className="mb-8 text-sm sm:text-base leading-relaxed text-justify"
          variants={fadeUp}
          custom={2}
        >
          Welcome to <span className="font-semibold">Yabuwat Atelier</span> —
          your destination for timeless fashion that speaks to individuality,
          confidence, and creativity. Founded with a passion for self-expression
          through clothing, we are more than just an e-commerce platform; we are
          a movement celebrating style, culture, and the spirit of innovation.
        </motion.p>

        {[
          {
            title: "Our Vision",
            text: "To redefine modern fashion by merging tradition with trend — creating clothing that empowers, inspires, and stands out.",
          },
          {
            title: "Our Mission",
            text: "To offer quality, affordable, and stylish pieces that allow our customers to express their unique identity through every outfit.",
          },
          {
            title: "What We Offer",
            text: (
              <ul className="list-disc pl-5 space-y-1">
                <li>Curated collections for every occasion</li>
                <li>Trendy & timeless designs</li>
                <li>Quality and comfort in every piece</li>
              </ul>
            ),
          },
          {
            title: "Why Yabuwat Atelier?",
            text: "“Yabuwat” is more than a name — it’s a symbol of elegance, strength, and originality. Every stitch tells a story. We believe fashion should be bold, inclusive, and a true reflection of who you are.",
          },
          {
            title: "Join Our Community",
            text: "From our online store to your doorstep, Yabuwat Atelier is here to make fashion accessible and expressive. Join a community that’s confident, stylish, and unapologetically original.",
          },
        ].map((section, idx) => (
          <motion.div
            key={section.title}
            className="mb-8"
            variants={fadeUp}
            custom={idx + 3}
          >
            <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
            <div className="text-sm sm:text-base leading-relaxed">
              {section.text}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
};

export default About;
