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
    <div>
      {/* Hero Section - Full width for video background */}
      <section>
        <Hero />
      </section>
      
      <section className='padding'>
        <PopularProducts />
      </section>
      
      {/* Logo Marquee Section - Below PopularProducts */}
      <LogoMarquee 
        animationDuration={80}
        gap={150}
      />
      
      {/* Promotional Sections - Kobe & African Heritage */}
      <PromoSections />
      
      <section className='padding'>
        <LiveProducts />
      </section>
      <section className='padding'>
        <SuperQuality />
      </section>
      <section className='padding-x py-10'>
        <Services />
      </section>
      <section className='padding'>
        <SpecialOffer />
      </section>
      <section className='padding-x sm:py-32 py-16 w-full'>
        <Subscribe />
      </section>
      <section className='bg-black padding-x padding-t pb-8'>
        <Footer />
      </section>
      
      {/* Floating Chat - Always visible */}
      <FloatingChat />
    </div>
  );
};

export default Home; 