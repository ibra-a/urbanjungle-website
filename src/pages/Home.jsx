import React from 'react';
import {
  Footer,
  Hero,
  PopularProducts,
  Services,
  SpecialOffer,
  Subscribe,
  SuperQuality,
} from "../sections";
import LiveProducts from "../sections/LiveProducts";
import { LogoMarquee, FloatingChat, PromoSections } from "../components";

const Home = () => {
  return (
    <div className="scroll-smooth">
      {/* Hero Section - Full width for video background */}
      <section>
        <Hero />
      </section>
      
      {/* Popular Products Section */}
      <section className='padding py-16 sm:py-20'>
        <PopularProducts />
      </section>
      
      {/* Logo Marquee Section - Below PopularProducts */}
      <section className='py-8 sm:py-12'>
        <LogoMarquee 
          animationDuration={80}
          gap={150}
        />
      </section>
      
      {/* Promotional Sections - Kobe & African Heritage */}
      <section className='py-8 sm:py-12'>
        <PromoSections />
      </section>
      
      {/* Live Products Section */}
      <section className='padding py-16 sm:py-20'>
        <LiveProducts />
      </section>
      
      {/* Super Quality Section */}
      <section className='padding py-16 sm:py-20'>
        <SuperQuality />
      </section>
      
      {/* Services Section */}
      <section className='padding-x py-10'>
        <Services />
      </section>
      
      {/* Special Offer Section */}
      <section className='padding py-16 sm:py-20'>
        <SpecialOffer />
      </section>
      
      {/* Subscribe Section */}
      <section className='padding-x sm:py-32 py-16 w-full bg-black'>
        <Subscribe />
      </section>
      
      {/* Footer Section */}
      <section className='bg-black padding-x padding-t pb-8'>
        <Footer />
      </section>
      
      {/* Floating Chat - Always visible */}
      <FloatingChat />
    </div>
  );
};

export default Home; 