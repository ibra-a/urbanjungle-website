import { mbappeNike } from "../assets/images";
import { Button } from "../components";

const SuperQuality = () => {
  return (
    <section
      id='about-us'
      className='flex justify-between items-center max-lg:flex-col gap-10 w-full max-container relative'
    >
      <div className='flex flex-1 flex-col'>
        <h2 className='font-palanquin capitalize text-4xl lg:max-w-lg font-bold'>
          Be Aware Of Our
          <span className='text-coral-red'> Super </span>
          <span className='text-coral-red'>Promotions </span>
        </h2>
        <p className='mt-4 lg:max-w-lg info-text'>
          Stay updated with our exclusive deals and limited-time offers. 
          Don't miss out on incredible savings and special promotions 
          designed to bring you premium footwear at unbeatable prices.
        </p>
        <p className='mt-6 lg:max-w-lg info-text'>
          Our promotional campaigns ensure you get the best value for the latest collections from top brands
        </p>
        <div className='mt-11'>
          <Button label='View promotions' />
        </div>
      </div>

      <div className='flex-1 flex justify-center items-center relative'>
        {/* Dynamic gradient background */}
        <div className="mbappe-bg-gradient"></div>
        
        {/* Main Mbappe container with glow effects */}
        <div className="mbappe-container">
          <div className="mbappe-glow-border">
            <img
              src={mbappeNike}
              alt='Urban Jungle Collection'
              width={570}
              height={522}
              className='mbappe-image'
            />
          </div>
          
          {/* Floating promotional badges */}
          <div className="mbappe-badge mbappe-badge-1">
            <span className="badge-text">LIMITED</span>
          </div>
          <div className="mbappe-badge mbappe-badge-2">
            <span className="badge-text">NEW</span>
          </div>
          <div className="mbappe-badge mbappe-badge-3">
            <span className="badge-text">30% OFF</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuperQuality;
