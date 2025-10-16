const ServiceCard = ({ imgURL, label, subtext }) => {
  return (
    <div className="service-card-container">
      <div className="service-card-glow-border">
        <div className="service-card-content">
          <div className="service-icon-container">
            <img src={imgURL} alt={label} width={24} height={24} />
          </div>
          <h3 className="service-title">
            {label}
          </h3>
          <p className="service-description">
            {subtext}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
