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
import { LogoMarquee, FloatingChat, PromoSections, ScrollToTopButton } from "../components";

const Home = () => {
  return (
    <div className="scroll-smooth">
      {/* Hero Section - Full width for video background */}
      <section>
        <Hero />
      </section>
      
      {/* Popular Products Section */}
      <section className='padding py-16 sm:py-20 relative'>
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent pointer-events-none'></div>
        <PopularProducts />
      </section>
      
      {/* Logo Marquee Section - Below PopularProducts */}
      <section className='py-12 sm:py-16 relative'>
        <div className='absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/5 pointer-events-none'></div>
        <LogoMarquee 
          animationDuration={80}
          gap={150}
        />
      </section>
      
      {/* Promotional Sections - Kobe & African Heritage */}
      <section className='py-12 sm:py-16 relative'>
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent pointer-events-none'></div>
        <PromoSections />
      </section>
      
      {/* Live Products Section */}
      <section className='padding py-16 sm:py-20 relative'>
        <div className='absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/5 pointer-events-none'></div>
        <LiveProducts />
      </section>
      
      {/* Super Quality Section */}
      <section className='padding py-16 sm:py-20 relative'>
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent pointer-events-none'></div>
        <SuperQuality />
      </section>
      
      {/* Services Section */}
      <section className='padding-x py-16 sm:py-20 relative'>
        <div className='absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/5 pointer-events-none'></div>
        <Services />
      </section>
      
      {/* Special Offer Section */}
      <section className='padding py-16 sm:py-20 relative'>
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent pointer-events-none'></div>
        <SpecialOffer />
      </section>
      
      {/* Subscribe Section */}
      <section className='padding-x sm:py-32 py-16 w-full bg-black'>
        <Subscribe />
      </section>
      
      
      {/* Floating Chat - Always visible */}
      <FloatingChat />
      
      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
};

export default Home; 