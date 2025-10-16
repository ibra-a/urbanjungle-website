import { services } from "../constants";
import { ServiceCard } from "../components";

const Services = () => {
  return (
    <section className="services-grid-only">
      {services.map((service) => (
        <ServiceCard key={service.label} {...service} />
      ))}
    </section>
  );
};

export default Services;
