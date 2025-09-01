// info.js
console.log("info.js cargado correctamente");

const selectedId = Number(localStorage.getItem("selectedProductId"));

async function fetchProductById(id) {
  try {
    //  ----------- TRAEMOS TODOS LOS PRODUCTOS CON POPULATE PARA INCLUIR LOS MEDIOS -----------
    const res = await fetch(`https://playful-friendship-cd80f76481.strapiapp.com/api/products?populate=*`);
    if (!res.ok) throw new Error("No se pudieron cargar los productos");

    const { data } = await res.json();

    const item = data.find(p => p.id === id);
    if (!item) throw new Error("Producto no encontrado");

    // ----------- MAPEAR infoImege DESDE STRAPI -----------
    const imageInfo = Array.isArray(item.imageInfo) && item.imageInfo.length
      ? item.imageInfo.map(img => img?.url ? `https://playful-friendship-cd80f76481.strapiapp.com/${img.url}` : "https://via.placeholder.com/300x300?text=No+Image")
      : [item.image?.url ? `https://playful-friendship-cd80f76481.strapiapp.com/${item.image.url}` : "https://via.placeholder.com/300x300?text=No+Image"];

    const product = {
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      description: item.description,
      imageInfo: imageInfo,
      inStock: item.inStock || false,
      availableQuantity: item.availableQuantity || 0,
    };

    console.log("Producto cargado:", product);

    // ----------- INYECTAR DATOS EN EL DOM -----------
    const nameEl = document.getElementById("product-name");
    const brandEl = document.getElementById("product-brand");
    const descEl = document.getElementById("product-description");
    const imgContainer = document.getElementById("product-images");
    const availableQuantity = document.getElementById("available-quantity");

    if (availableQuantity) availableQuantity.textContent = `Available Quantity: ${product.availableQuantity}`;
    if (nameEl) nameEl.textContent = product.name;
    if (brandEl) brandEl.textContent = product.brand;
    if (descEl) descEl.innerHTML = product.description || "";

    if (imgContainer) {
      imgContainer.innerHTML = `
<div class="swiper product-swiper">
  <div class="swiper-wrapper">
    ${product.imageInfo.map(imgUrl => `
      <div class="swiper-slide">
        <div class="swiper-image-wrapper">
          <div class="product-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}">
            ${product.inStock ? 'In Stock' : 'Out of Stock'}
          </div>
          <img src="${imgUrl}" alt="${product.name}" class="product-image" />
        </div>
      </div>
    `).join('')}
  </div>
  <div class="swiper-pagination"></div>
  <div class="swiper-button-next"></div>
  <div class="swiper-button-prev"></div>
</div>

      `;
    }

    // ----------- INICIALIZAR SWIPER -----------
    new Swiper(".product-swiper", {
      loop: product.imageInfo.length > 1,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      spaceBetween: 10,
      slidesPerView: 1,
    });

  } catch (err) {
    console.error("Error cargando producto:", err);
  }
}

if (selectedId) {
  fetchProductById(selectedId);
} else {
  console.error("No hay producto seleccionado");
}
