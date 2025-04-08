let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderProducts() {
  fetch("products.json")
    .then((res) => res.json())
    .then((data) => {
      const productList = document.getElementById("product-list");
      productList.innerHTML = "";
      data.forEach((product, index) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${product.image}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <select id="select-${index}">
            ${product.options
              .map(
                (opt) =>
                  `<option value="${opt.diopter}" data-price="${opt.price}">${opt.diopter} (${opt.price} грн)</option>`
              )
              .join("")}
          </select>
          <button onclick="addToCart(${index})">Добавить в корзину</button>
        `;
        productList.appendChild(card);
      });
      window.products = data;
    });
}

function addToCart(index) {
  const select = document.getElementById(`select-${index}`);
  const diopter = select.value;
  const price = parseFloat(select.selectedOptions[0].dataset.price);
  const product = products[index];
  const item = {
    name: product.name,
    diopter,
    price,
  };
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Товар добавлен в корзину!");
}

function openCart() {
  const modal = document.getElementById("cart-modal");
  const itemsContainer = document.getElementById("cart-items");
  const totalSum = document.getElementById("total-sum");
  itemsContainer.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${item.name} (${item.diopter}) - ${item.price} грн</span>
      <button onclick="removeItem(${index})">🗑️</button>
    `;
    itemsContainer.appendChild(div);
  });
  totalSum.textContent = `Сумма: ${total} грн`;
  modal.style.display = "block";
}

function closeCart() {
  document.getElementById("cart-modal").style.display = "none";
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  openCart();
}

function sendOrder() {
  const name = document.getElementById("user-name").value.trim();
  const phone = document.getElementById("user-phone").value.trim();
  const note = document.getElementById("user-note").value.trim();

  if (!name || !phone) {
    alert("Пожалуйста, заполните имя и телефон.");
    return;
  }

  if (cart.length === 0) {
    alert("Корзина пуста!");
    return;
  }

  const message = `
Новый заказ:
Имя: ${name}
Телефон: ${phone}
Комментарий: ${note || "-"}
Товары:
${cart
  .map((item) => `• ${item.name} (${item.diopter}) - ${item.price} грн`)
  .join("\n")}
Сумма: ${cart.reduce((sum, item) => sum + item.price, 0)} грн
  `;

  const token = "7891353623:AAHcw3UdOk4BgEoiB3HaIr4x0UhcDsJAXUs";
  const chatId = "-1002333743964";

  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        alert("Заказ успешно отправлен!");
        cart = [];
        localStorage.removeItem("cart");
        closeCart();
      } else {
        alert("Ошибка при отправке заказа.");
      }
    });
}

document.getElementById("cart-button").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
document.getElementById("send-order").addEventListener("click", sendOrder);

renderProducts();
