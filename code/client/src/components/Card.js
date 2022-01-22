import React from 'react';

function Card({ card}) {
  return <div className = "card">
  <div style={{backgroundImage: `url(${card.image_url})` }}>

  </div>
  </div>;
}

export default Card;
