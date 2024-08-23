// Array to hold all products for search and filter purposes
let allProducts = [];

// Function to fetch and populate product categories in the dropdown list
function getCategories() {
  fetch("https://fakestoreapi.com/products/categories")
    .then((response) => response.json()) // Convert response to JSON
    .then((data) => {
      data.unshift("all"); // Add "all" category as the first option
      const lstCategories = document.getElementById("lstCategories");
      data.forEach((item) => {
        const option = document.createElement("option");
        option.text = item.toUpperCase(); // Display category name in uppercase
        option.value = item; // Set value attribute to category name
        lstCategories.appendChild(option); // Append option to dropdown
      });
    })
    .catch((error) => console.error("Error fetching categories:", error)); // Handle errors
}

// Function to fetch and display products based on the URL
function getProducts(url) {
  document.getElementById("productsContainer").innerHTML = ""; // Clear previous products
  fetch(url)
    .then((response) => response.json()) // Convert response to JSON
    .then((data) => {
      allProducts = data; // Store products in the global array
      displayProducts(data); // Call function to display products
    })
    .catch((error) => console.error("Error fetching products:", error)); // Handle errors
}

// Function to create and display product cards
function displayProducts(products) {
  const container = document.getElementById("productsContainer");
  container.innerHTML = ""; // Clear previous products
  products.forEach((item) => {
    const div = document.createElement("div");
    div.className = "card m-2 p-2"; // Set card styling
    div.style.width = "275px";

    // Generate rating stars based on product rating
    const ratingStars =
      "★".repeat(Math.floor(item.rating.rate)) +
      "☆".repeat(5 - Math.floor(item.rating.rate));

    // Truncate title if it's too long
    const truncatedTitle =
      item.title.length > 70 ? item.title.substring(0, 70) + "..." : item.title;

    // Set the HTML content for the product card
    div.innerHTML = `
      <img src="${
        item.image
      }" class="card-img-top" style="height: 250px" onclick="showProductDetails(${
      item.id
    })" alt="${truncatedTitle}">
      <div class="card-header product-title" style="height: 100px;">
        <p onclick="showProductDetails(${item.id})">${truncatedTitle}</p>
      </div>
      <div class="card-body">
        <p class="product-price">Price: $${item.price.toFixed(2)}</p>
        <p class="product-rating">${ratingStars}</p>
        <p class="color-secondary">(${item.rating.count} reviews)</p>
      </div>
      <div class="card-footer">
        <button id="cartButton-${
          item.id
        }" class="btn btn-danger w-100" onclick="addToCartClick(${item.id})">
          <span class="bi bi-cart4"></span> Add to Cart
        </button>
      </div>
    `;

    container.appendChild(div); // Add the card to the container
  });
}

// Function to initialize the page by loading categories and products
function bodyload() {
  getCategories();
  getProducts("https://fakestoreapi.com/products");
  getCartItemsCount(); // Update cart item count
}

// Function to handle category changes and fetch products accordingly
function categoryChange() {
  const categoryName = document.getElementById("lstCategories").value;
  const url =
    categoryName === "all"
      ? "https://fakestoreapi.com/products"
      : `https://fakestoreapi.com/products/category/${categoryName}`;
  getProducts(url); // Fetch products based on selected category
}

let cartItems = []; // Array to hold items in the cart
let count = 0; // Counter for the number of items in the cart

// Function to update the count of items in the cart
function getCartItemsCount() {
  count = cartItems.length;
  document.getElementById("countCart").textContent = count; // Update cart count display
}

// Function to handle adding a product to the cart
function addToCartClick(id) {
  fetch(`https://fakestoreapi.com/products/${id}`)
    .then((response) => response.json()) // Convert response to JSON
    .then((data) => {
      const cartItem = cartItems.find((item) => item.id === data.id); // Check if item is already in cart
      if (cartItem) {
        cartItem.quantity += 1; // Increase quantity if item is already in cart
      } else {
        data.quantity = 1; // Set initial quantity for new item
        cartItems.push(data); // Add item to cart
      }
      addToCartAlert(true); // Show confirmation alert
      updateCartButton(id, true); // Update button state
      getCartItemsCount(); // Update cart count
    })
    .catch((error) => console.error("Error adding to cart:", error)); // Handle errors
}

// Function to show a toast alert when an item is added or removed from the cart
function addToCartAlert(status) {
  const message = `Product ${status ? "added to" : "removed from"} cart!`;
  document.querySelector(".toast-container").innerHTML = `
    <div id="cartToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto"><span style='color:red;font-size: 1.5rem'>S</span>hopSavvy</strong>
        <small>Just now</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">${message}</div>
    </div>
  `;
  const toast = new bootstrap.Toast(document.getElementById("cartToast"));
  toast.show(); // Show toast notification
}

// Function to update the cart button based on whether the item is in the cart
function updateCartButton(id, inCart) {
  const button = document.getElementById(`cartButton-${id}`);
  if (inCart) {
    button.innerHTML = '<span class="bi bi-cart4"></span> Go to Cart';
    button.className = "btn btn-secondary w-100";
    button.onclick = () => {
      showCartClick();
      const cartModal = new bootstrap.Modal(document.getElementById("cart"));
      cartModal.show(); // Show cart modal
    };
  } else {
    button.innerHTML = '<span class="bi bi-cart4"></span> Add to Cart';
    button.className = "btn btn-danger w-100";
    button.onclick = () => addToCartClick(id); // Add item to cart
  }
}

// Function to update the total price of items in the cart
function updateCartTotal() {
  const totalValue = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  document.getElementById(
    "cartTotal"
  ).textContent = `Total: $${totalValue.toFixed(2)}`; // Display total price
}

// Function to display cart items in a modal
function showCartClick() {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = ""; // Clear previous cart items
  cartItems.forEach((item) => {
    const tr = document.createElement("tr");

    // Create table cells for cart item details
    const tdTitle = document.createElement("td");
    tdTitle.textContent = item.title;

    const tdPrice = document.createElement("td");
    tdPrice.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

    const tdQuantity = document.createElement("td");
    tdQuantity.innerHTML = `
      <div class="input-group">
        <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${item.id}, -1)">-</button>
        <input type="text" class="form-control text-center" value="${item.quantity}" disabled>
        <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${item.id}, 1)">+</button>
      </div>
    `;

    const tdPreview = document.createElement("td");
    const img = document.createElement("img");
    img.src = item.image;
    img.width = 100;
    img.height = 100;
    tdPreview.appendChild(img);

    // Append cells to the row and row to the table body
    tr.appendChild(tdTitle);
    tr.appendChild(tdPrice);
    tr.appendChild(tdQuantity);
    tr.appendChild(tdPreview);

    tbody.appendChild(tr);
  });

  updateCartTotal(); // Update total price
  cartItems.forEach((item) => {
    updateCartButton(item.id, item.quantity > 0); // Update button state
  });
}

// Function to update the quantity of an item in the cart
function updateQuantity(id, change) {
  const cartItem = cartItems.find((item) => item.id === id);
  if (cartItem) {
    cartItem.quantity += change; // Adjust quantity
    if (cartItem.quantity < 0) cartItem.quantity = 0; // Prevent negative quantity
    if (cartItem.quantity === 0) {
      addToCartAlert(false); // Show removal alert
      cartItems = cartItems.filter((item) => item.id !== id); // Remove item from cart
    }
    showCartClick(); // Refresh cart display
    getCartItemsCount(); // Update cart count
    updateCartButton(
      id,
      cartItems.some((item) => item.id === id) // Update button state
    );
  }
}

// Function to display detailed information about a product in a modal
function showProductDetails(id) {
  fetch(`https://fakestoreapi.com/products/${id}`)
    .then((response) => response.json()) // Convert response to JSON
    .then((data) => {
      const ratingStars = Array.from({ length: 5 }, (_, index) =>
        index < Math.floor(data.rating.rate) ? "★" : "☆"
      ).join(" ");
      const capitalizedCategory =
        data.category.charAt(0).toUpperCase() + data.category.slice(1);

      // Set the content of the product details modal
      document.getElementById("productDetailsModalTitle").innerHTML =
        "<span style='font-weight: bold;'>Product Details</span>";
      document.getElementById("productDetailsModalBody").innerHTML = `
        <div class="d-flex align-items-center mb-3">
          <img src="${
            data.image
          }" class="img-fluid product-details-image" alt="${
        data.title
      }" style="max-width: 300px; margin-right: 20px;">
          <div>
            <p><strong>${data.title}</strong></p>
            <p>${data.description}</p>
            <p><strong>Category:</strong> ${capitalizedCategory}</p>
            <p><strong>Price:</strong> $${data.price}</p>
            <p><strong>Rating:</strong> ${ratingStars} (${
        data.rating.count
      } reviews)</p>
            <p><strong>Manufacturer:</strong> ${data.brand || "N/A"}</p>
          </div>
        </div>
      `;

      const productDetailsModal = new bootstrap.Modal(
        document.getElementById("productDetailsModal")
      );
      productDetailsModal.show(); // Show product details modal
    })
    .catch((error) => console.error("Error fetching product details:", error)); // Handle errors
}

function searchProducts() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filteredProducts = allProducts.filter((product) =>
    product.title.toLowerCase().includes(query)
  );
  if (filteredProducts.length === 0) {
    window.alert("Sorry, Item not Found!!");
    document.getElementById("lstCategories").value = "all";
    getProducts("https://fakestoreapi.com/products");
  } else {
    displayProducts(filteredProducts);
  }
}
