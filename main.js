async function getRentals() {
  const rentalFetch = await fetch('http://localhost:5000/18,30');
  const rentalJson = await rentalFetch.json();
  console.log('rentalJson:', rentalJson);
  const rentals = document.querySelector('.rentals');
  if (rentals) {
    let html = '';
    rentalJson.forEach((rental) => {
      const image = rental.picture_url;
      const roomType = rental.room_type;
      const name = rental.name;
      let guests = rental.accommodates;
      let bedrooms = rental.bedrooms;
      let beds = rental.beds;
      let baths = rental.bathrooms;
      const street = rental.street;
      let numReviews = rental.number_of_reviews;
      const ratingValue = rental.review_scores_value;
      const price = rental.price;
      const description = rental.description;

      // plurals:
      guests = guests > 1 ? `${guests} guests` : `${guests} guest`;
      bedrooms = bedrooms > 1 ? `${bedrooms} bedrooms` : `${bedrooms} bedroom`;
      beds = beds > 1 ? `${beds} beds` : `${beds} bed`;
      baths = baths > 1 ? `${baths} baths` : `${baths} bath`;
      numReviews =
        numReviews > 1 ? `${numReviews} reviews` : `${numReviews} review`;

      html += `
            <div class="card">
            <img src="${image}" alt="image of rental property" class="card__image">
            <div class="card__details">
            <div class="card_subtitle">${roomType}</div>
            <div class="card__title">${name}</div>
                <small class="card__street">${street}</small>
                <small class="card_rooms">${guests} &middot; ${bedrooms} &middot; ${beds} &middot; ${baths}</small>
                <div class="card__description">${description}</div>
                <small class="card__bottom">
                    <div class="card__stars"><strong>&star;</strong> ${ratingValue}/10 &middot; (${numReviews})</div>
                    <div class="card__price">Price: ${price} a day</div>
                </small>
            </div>
        </div>     
        `;
      rentals.innerHTML = html;
    });
  }
}

getRentals();
