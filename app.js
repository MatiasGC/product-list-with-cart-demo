const template = document.getElementById("dessert-template");
const DESSERT_CONTAINER = document.querySelector(".dessert-container");
const DESSERT_SECTION = document.querySelector(".dessert-section");
const CART_SECTION = document.querySelector(".cart-section");
const LOADER = document.querySelector(".loader-container");
const CART_INFO = document.querySelector(".cart .info");
const ITEMS_QUANTITY_SPAN = document.querySelector(".items-quantity");
const ATTRIBUTION = document.querySelector(".attribution");
let cart = [];

// Persistance helpers
const saveCartToLocalStorage = () => {
  // convert the cart array into a JSON object
  const cartJSON = JSON.stringify(cart);

  localStorage.setItem("dessertCart", cartJSON);
};

const loadCartFromLocalStorage = () => {
  const savedCartJSON = localStorage.getItem("dessertCart");

  if (savedCartJSON) {
    const loadedCart = JSON.parse(savedCartJSON);
    cart = loadedCart;
  }
};
// End Persistance helper

// --

// Data helpers
const extractProductData = (cardData) => {
  const priceText = cardData.querySelector(".price").textContent;
  return {
    productId: cardData.dataset.id,
    productName: cardData.querySelector(".title").textContent,
    productTitle: cardData.querySelector(".name").textContent,
    productPrice: Number(priceText.replace("$", "")),
    productThumbnail: cardData.dataset.thumbnail,
    quantity: 1,
  };
};

const updateProductCardUI = (productId, quantity) => {
  const dessertCard = document
    .querySelector(`.card-data[data-id="${productId}"]`)
    .closest(".dessert-card");
  if (!dessertCard) return;
  const productActions = dessertCard.querySelector(".product-actions");
  const addButton = productActions.querySelector(".add");
  const quantityControls = productActions.querySelector(".quantity-controls");
  const productImage = dessertCard.querySelector(".product-image");
  if (quantity > 0) {
    addButton.style.display = "none";
    quantityControls.style.display = "flex";
    quantityControls.querySelector(".quantity").textContent = quantity;
    productImage.style.border = "2px solid red";
  } else {
    addButton.style.display = "flex";
    quantityControls.style.display = "none";
    productImage.style.border = "none";
  }
};

const generateCartItemHTML = (p) => {
  return `
    <div class='flex-product'>
      <div>
        <p class='product-title'>${p.productName}</p>
        <span class='product-quantity'>${p.quantity}x</span>
        <span class='single-price'>@ $${p.productPrice.toFixed(2)}</span>
        <span class='total-price'>$${(p.productPrice * p.quantity).toFixed(
          2
        )}</span>
        </div>
      <button class='remove' data-id="${p.productId}">
        <img src='./assets/images/icon-remove-item.svg' alt='remove product'/>
      </button>
    </div>
    <hr>
  `;
};
// End Data helpers

// --

// Cart Logic
const addToCart = (e) => {
  const dessertCard = e.target.closest(".dessert-card");
  const cardData = dessertCard.querySelector(".card-data");

  const newProduct = extractProductData(cardData);

  //Add product to Cart
  cart.push(newProduct);

  //UI update
  updateProductCardUI(newProduct.productId, 1);

  showProductsInCart();

  saveCartToLocalStorage();
};

const decrement = (e) => {
  let productId = e.target.closest(".dessert-card").querySelector(".card-data")
    .dataset.id;
  const product = cart.find((p) => p.productId === productId);
  if (!product) return;

  if (product.quantity > 1) {
    product.quantity -= 1;
  } else {
    cart = cart.filter((p) => p.productId !== productId);
    product.quantity = 0;
  }
  updateProductCardUI(productId, product.quantity);

  showProductsInCart();

  saveCartToLocalStorage();
};

const increment = (e) => {
  const productId = e.target
    .closest(".dessert-card")
    .querySelector(".card-data").dataset.id;
  const product = cart.find((p) => p.productId === productId);
  if (!product) return;
  product.quantity += 1;
  updateProductCardUI(productId, product.quantity);
  showProductsInCart();
  saveCartToLocalStorage();
};
// End Cart Logic

// Cart rendering
const showProductsInCart = () => {
  const cartInfo = document.querySelector(".cart .info");

  if (cart.length === 0) {
    cartInfo.classList.remove("not-empty");
    cartInfo.innerHTML = `
      <img src="./assets/images/illustration-empty-cart.svg" alt="logo empty cart" />
      <p class="no-items">Your added items will appear here</p>
    `;
  } else {
    cartInfo.classList.add("not-empty");
    let productsHTML = "";
    let totalPrice = 0;
    cart.forEach((p) => {
      productsHTML += generateCartItemHTML(p);
      totalPrice += p.productPrice * p.quantity;
    });

    const cartTotalHTML = `
      <div class='total-order'>
        <p>Order Total</p>
        <span>$${totalPrice.toFixed(2)}</span>
      </div>
      <p class='carbon-neutral'>This is a <strong>carbon-neutral</strong> delivery</p>
      <button class='confirm-order'>Confirm Order</button>
      `;

    cartInfo.innerHTML = productsHTML + cartTotalHTML;
  }

  const totalProducts = cart.reduce((acc, item) => acc + item.quantity, 0);
  document.querySelector(".items-quantity").textContent = totalProducts;
};

// --

// Modal managment
const closeModal = () => {
  const modal = document.querySelector(".modal-backdrop");
  modal.style.display = "none";
  document.body.classList.remove("no-scroll");
};

const openModal = () => {
  const modal = document.querySelector(".modal-backdrop");
  modal.style.display = "flex";
  document.body.classList.add("no-scroll");
  fillModal();
};

const fillModal = () => {
  const modalContainer = document.querySelector(".modal-product-container");
  modalContainer.innerHTML = "";
  cart.forEach((p) => {
    modalContainer.insertAdjacentHTML(
      "beforeend",
      `
        <div class="modal-flex-product">
            <img src=${p.productThumbnail} alt=${p.productName} />
            <div class="modal-product-info">
              <p>${p.productName}</p>
              <div>
                <span>${p.quantity}x</span>
                <span>@${p.productPrice.toFixed(2)}</span>
              </div>
            </div>
            <p class="modal-product-price">
              <span>$${(p.quantity * p.productPrice).toFixed(2)}</span>
            </p>
          </div>  
          <hr>
    `
    );
  });
  const total = cart.reduce((acc, p) => acc + p.productPrice * p.quantity, 0);
  document.querySelector(".total-order span").textContent =
    "$" + total.toFixed(2);
};
// End modal managment

//Event listeners - user interactions
DESSERT_CONTAINER.addEventListener("click", (e) => {
  const target = e.target;
  if (target.classList.contains("add")) {
    addToCart(e);
  } else if (target.classList.contains("btn-increment")) {
    increment(e);
  } else if (target.classList.contains("btn-decrement")) {
    decrement(e);
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("confirm-order")) {
    openModal();
    return;
  }
  if (e.target.classList.contains("new-order")) {
    let oldCart = cart;
    oldCart.forEach((p) => updateProductCardUI(p.productId, 0));
    cart = [];
    closeModal();
    showProductsInCart();
    saveCartToLocalStorage();
    return;
  }

  const btnRemove = e.target.closest(".remove[data-id]");
  if (btnRemove) {
    const removedId = btnRemove.dataset.id;
    cart = cart.filter((p) => p.productId !== removedId);
    updateProductCardUI(removedId, 0);
    showProductsInCart();
    saveCartToLocalStorage();
  }
});

// Show all products - first load
const renderAllProducts = async () => {
  LOADER.style.display = "block";
  DESSERT_CONTAINER.innerHTML = "";
  DESSERT_SECTION.style.display = "none";
  CART_SECTION.style.display = "none";
  ATTRIBUTION.style.display = "none";

  await new Promise((resolve) => setTimeout(resolve, 2000));
  try {
    const response = await fetch("data.json");
    if (!response.ok) {
      throw new Error(`Error ${response.status}: Unable to load products`);
    }
    const productsData = await response.json();

    LOADER.style.display = "none";
    DESSERT_SECTION.style.display = "block";
    CART_SECTION.style.display = "block";
    ATTRIBUTION.style.display = "block";

    productsData.forEach((element, index) => {
      const clone = template.content.cloneNode(true);
      const productId = index + 1;
      clone.querySelector("picture .desktop").srcset = element.image.desktop;
      clone.querySelector("picture .tablet").srcset = element.image.tablet;
      clone.querySelector("picture img").src = element.image.mobile;
      clone.querySelector("picture img").alt = element.name;
      clone.querySelector(".name").textContent = element.category;
      clone.querySelector(".title").textContent = element.name;
      clone.querySelector(".price").textContent = `$${element.price.toFixed(
        2
      )}`;
      const cardDataElement = clone.querySelector(".card-data");
      cardDataElement.dataset.id = productId;
      cardDataElement.dataset.thumbnail = element.image.thumbnail;
      DESSERT_CONTAINER.appendChild(clone);
    });

    loadCartFromLocalStorage();

    cart.forEach((p) => updateProductCardUI(p.productId, p.quantity));
    showProductsInCart();
  } catch (error) {
    // Display an error message to the user or log the error
    console.error(error);
    LOADER.style.display = "none";
    DESSERT_SECTION.style.display = "block";
    CART_SECTION.style.display = "block";
    DESSERT_CONTAINER.style.display = "block";
    DESSERT_CONTAINER.innerHTML = `
      <div class='error-fetching'>
        <p>⚠️ Oops! Something went wrong while loading the products.</p>
        <p>Please refresh the page or try again later.</p>
      </div>`;
  }
};

renderAllProducts();
