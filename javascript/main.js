console.log("main.js cargado correctamente");

function iniciarApp() {
  // ----------- REFERENCIAS DOM -----------
  const menuToggle = document.getElementById('menuToggle');
  const barsMenu = document.getElementById('navMenu');
  const cartIcon = document.querySelector('.cart-icon');
  const cartMenu = document.querySelector('.cart');
  const overlay = document.getElementById('overlay');
  const navbarLinks = document.querySelectorAll('.navbar-link');
  const productsCart = document.querySelector('.cart-container');
  const total = document.querySelector('.total');
  const buyBtn = document.querySelector('.btn-buy');
  const deleteBtn = document.querySelector('.btn-delete');
  const cartBubble = document.querySelector('.cart-bubble');
  const closeCartBtn = document.getElementById('cartCloseBtn');
  const closeMenuBtn = document.getElementById('menuCloseBtn');
  const productsContainer = document.querySelector(".products-container");
  const clientForm = document.getElementById('orderForm');
  const paypalContainer = document.getElementById('paypal-button-container');
  const completeSection = document.querySelector('.complete-buy-section');
  const addModal = document.querySelector('.add-modal'); // modal de producto añadido

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let gorras = []; // GUARDAMOS LOS PRODUCTOS AQUÍ DESDE STRAPI

  // ----------- MENÚ Y CARRITO -----------
  const toggleMenu = () => {
    if (barsMenu) barsMenu.classList.toggle("open");
    if (cartMenu && cartMenu.classList.contains("open-cart")) {
      cartMenu.classList.remove("open-cart");
      if (overlay) overlay.classList.remove("show-overlay");
      return;
    }
    if (overlay) overlay.classList.toggle("show-overlay");
  };

  const toggleCart = () => {
    if (cartMenu) cartMenu.classList.toggle("open-cart");
    if (barsMenu && barsMenu.classList.contains("open")) {
      barsMenu.classList.remove("open");
      if (overlay) overlay.classList.remove("show-overlay");
      return;
    }
    if (overlay) overlay.classList.toggle("show-overlay");
  };

  const closeOnClick = (e) => {
    if (!e.target.classList.contains("navbar-link")) return;
    if (barsMenu) barsMenu.classList.remove("open");
    if (overlay) overlay.classList.remove("show-overlay");
  };

  const closeOnOverlayClick = () => {
    if (barsMenu) barsMenu.classList.remove("open");
    if (cartMenu) cartMenu.classList.remove("open-cart");
    if (overlay) overlay.classList.remove("show-overlay");
  };

  const closeCart = () => {
    if (cartMenu) cartMenu.classList.remove("open-cart");
    if (overlay) overlay.classList.remove("show-overlay");
  };

  const closeMenu = () => {
    if (barsMenu) barsMenu.classList.remove("open");
    if (overlay) overlay.classList.remove("show-overlay");
  };

  // ----------- RENDERIZADO DE PRODUCTOS -----------
  const renderProducts = () => {
    if (!productsContainer || !gorras.length) return;

    productsContainer.innerHTML = gorras.map(({ id, name, brand, price, image, inStock, availableQuantity }) => `
      <div class="product">
        <div class="product-image-wrapper">
          <div class="product-stock ${inStock ? 'in-stock' : 'out-of-stock'}">
            ${inStock ? 'In Stock' : 'Out of Stock'}
          </div>
          <img src="${image}" alt="product" class="product-img" />
        </div>
        <div class="product-text-container">
          <h3 class="product-name">${name}</h3>
          <h2 class="created-by-product">${brand}</h2>
          <p class="product-price">$${price.toFixed(2)}</p>
          <p class="available-quantity">Available: ${availableQuantity}</p>
        </div>
        <div class="btn-product-container">
          <button 
            class="btn-add" 
            data-id="${id}" 
            ${!inStock ? 'disabled style="background:#ccc;cursor:not-allowed;"' : ''}>
            ${inStock ? 'Add' : 'add'}
          </button>
          <button class="btn-info" data-id="${id}">INFO</button>
        </div>
      </div>
    `).join("");
  };

  // ----------- FETCH PRODUCTOS DESDE STRAPI -----------
const fetchProducts = async () => {
  try {
    const res = await fetch("https://playful-friendship-cd80f76481.strapiapp.com/api/products?populate=*");
    const { data } = await res.json();

    gorras = data.map(item => {
      const attrs = item.attributes;
      const imageUrl = attrs.image?.data?.attributes?.url
        ? `https://playful-friendship-cd80f76481.strapiapp.com${attrs.image.data.attributes.url}`
        : "https://via.placeholder.com/150";

      return {
        id: item.id,
        name: attrs.name,
        brand: attrs.brand,
        price: attrs.price,
        image: imageUrl,
        inStock: attrs.inStock,
        availableQuantity: attrs.availableQuantity,
      };
    });

    renderProducts();
  } catch (err) {
    console.error("Error cargando productos:", err);
  }
};


  // ----------- CARRITO -----------
  const saveCart = () => localStorage.setItem("cart", JSON.stringify(cart));

  const renderCart = () => {
    if (!productsCart) return;
    if (!cart.length) {
      productsCart.innerHTML = `<p class="empty-msg">There are no products in the cart.</p>`;
      return;
    }

    productsCart.innerHTML = cart.map(({ id, name, price, image, quantity }) => {
      const product = gorras.find(p => p.id === id);
      const maxQuantity = product ? product.availableQuantity : 0;
      const disableUp = quantity >= maxQuantity ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : '';

      return `
        <div class="cart-item">
          <img src="${image}" alt="producto" />
          <div class="item-info">
            <h3 class="item-title">${name}</h3>
            <p class="item-bid">Price</p>
            <span class="item-price">$ ${price}</span>
          </div>
          <div class="item-handler">
            <span class="quantity-handler down" data-id="${id}">-</span>
            <span class="item-quantity">${quantity}</span>
            <span class="quantity-handler up" data-id="${id}" ${disableUp}>+</span>
          </div>
        </div>
      `;
    }).join("");
  };

  const getCartTotal = () => cart.reduce((acc, cur) => cur.price * cur.quantity + acc, 0);
  const showCartTotal = () => { if (total) total.innerHTML = `$ ${getCartTotal().toFixed(2)}`; };
  const updateCartBubble = () => {
    if (!cartBubble) return;
    const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartBubble.textContent = totalQuantity > 0 ? totalQuantity : "0";
  };

  const updateCartState = () => {
    saveCart();
    renderCart();
    showCartTotal();
    updateCartBubble();
  };

  // ----------- MODAL PRODUCTO AÑADIDO -----------
  const showAddModal = () => {
    if (!addModal) return;
    addModal.classList.add("active-modal");
    setTimeout(() => addModal.classList.remove("active-modal"), 2000);
  };

  // ----------- MANEJO DE PRODUCTOS -----------
  const handleProductClick = (e) => {
    if (!gorras) return;
    if (e.target.classList.contains("btn-info")) {
      const id = Number(e.target.dataset.id);
      localStorage.setItem("selectedProductId", id);
      window.location.href = "info-section.html";
    }

    if (e.target.classList.contains("btn-add")) {
      const id = Number(e.target.dataset.id);
      const product = gorras.find(p => p.id === id);
      if (product) addProduct(product);
    }
  };

  const addProduct = (product) => {
    const existing = cart.find(p => p.id === product.id);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });
    updateCartState();
    showAddModal();
  };

  const handleQuantity = (e) => {
    const id = e.target.dataset.id;
    const product = cart.find(p => p.id.toString() === id);
    if (!product) return;

    const original = gorras.find(p => p.id.toString() === id);
    const maxQuantity = original ? original.availableQuantity : 0;

    if (e.target.classList.contains("down")) {
      if (product.quantity === 1) {
        if (confirm("¿Eliminar producto del carrito?")) cart = cart.filter(p => p.id !== product.id);
      } else product.quantity--;
    } else if (e.target.classList.contains("up")) {
      if (product.quantity < maxQuantity) product.quantity++;
    }

    updateCartState();
  };

  // ----------- PAYPAL -----------
  const renderPayPalButton = (cart) => {
    if (!window.paypal || !paypalContainer) return;
    paypalContainer.innerHTML = "";
    if (!cart.length) return;

    const total = getCartTotal();
    const totalValue = total > 0 ? total.toFixed(2) : "0.01";

    paypal.Buttons({
      createOrder: (data, actions) => actions.order.create({
        purchase_units: [{ amount: { value: totalValue } }]
      }),
      onApprove: (data, actions) => {
        return actions.order.capture().then(() => {
          emailjs.sendForm('service_4hsq0la', 'template_1sgzyxq', clientForm)
            .then(async () => {
              // Actualización de stock comentada
              localStorage.removeItem("cart");
              cart = [];
              updateCartState();
              paypalContainer.innerHTML = "";

              if (completeSection) {
                const resumen = cart.map(p => `${p.quantity}x ${p.name} - $${(p.quantity * p.price).toFixed(2)}`).join('<br>');
                completeSection.innerHTML = `
                  <div class="complete-buy-message">
                    <h2>Thank you for your purchase!</h2>
                    <p>You are now part of the Pony Club family. You will receive an email shortly with your order confirmation and tracking number.</p>
                    <div class="order-summary">
                      ${resumen}
                    </div>
                    <button id="backToShop">Back to Shop</button>
                  </div>
                `;
                const backBtn = document.getElementById('backToShop');
                if (backBtn) backBtn.addEventListener('click', () => {
                  window.location.href = "shop-now.html";
                });
              }
            })
            .catch(err => console.error("Error al enviar email:", err));
        });
      },
      onError: (err) => console.error("Error PayPal:", err)
    }).render("#paypal-button-container");
  };

  // ----------- FORMULARIO -----------
  if (clientForm) {
    clientForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const resumen = cart.map(p => `${p.quantity}x ${p.name} - $${(p.quantity * p.price).toFixed(2)}`).join('\n');
      document.getElementById("orderSummary").value = resumen;

      const cliente = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        country: document.getElementById("country").value,
        state: document.getElementById("state").value,
        city: document.getElementById("city").value,
        zip: document.getElementById("zip").value
      };
      sessionStorage.setItem('clienteData', JSON.stringify(cliente));

      clientForm.style.display = 'none';
      if (paypalContainer) paypalContainer.style.display = 'block';
      renderPayPalButton(cart);
    });
  }

  // ----------- EVENTOS -----------
  if (buyBtn) buyBtn.addEventListener("click", () => {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "complete-buy.html";
  });
  if (deleteBtn) deleteBtn.addEventListener("click", () => { cart = []; updateCartState(); });
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
  if (closeMenuBtn) closeMenuBtn.addEventListener("click", closeMenu);
  if (menuToggle) menuToggle.addEventListener("click", toggleMenu);
  if (cartIcon) cartIcon.addEventListener("click", toggleCart);
  if (navbarLinks) navbarLinks.forEach(link => link.addEventListener("click", closeOnClick));
  if (overlay) overlay.addEventListener("click", closeOnOverlayClick);
  if (productsContainer) productsContainer.addEventListener("click", handleProductClick);
  if (productsCart) productsCart.addEventListener("click", handleQuantity);

  // ----------- RENDER INICIAL -----------
  fetchProducts(); // CARGAMOS PRODUCTOS DESDE STRAPI
  updateCartState();
}

// ----------- INICIALIZAR APP AL CARGAR EL DOM -----------
document.addEventListener("DOMContentLoaded", iniciarApp);
