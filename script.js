/* =========================
   ZIVO JAVASCRIPT
   ========================= */

/* ---------- Firebase ---------- */

import { initializeApp } 
from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyBrMw31xVAszqXUvP6AiufOGL_6XdYoaM4",
  authDomain: "myai-bd693.firebaseapp.com",
  projectId: "myai-bd693",
  storageBucket: "myai-bd693.firebasestorage.app",
  messagingSenderId: "305975730704",
  appId: "1:305975730704:web:574551aa71831607a06095",
  measurementId: "G-DQN9NWSC9"
};


let firebaseApp = null;
let auth = null;
let db = null;
let googleProvider = null;

try {
  firebaseApp = initializeApp(firebaseConfig);

  auth = getAuth(firebaseApp);

  db = getFirestore(firebaseApp);

  googleProvider = new GoogleAuthProvider();

  googleProvider.setCustomParameters({
    prompt: "select_account"
  });

} catch (error) {
  console.error("Firebase error:", error);
}


/* ---------- Global state ---------- */

let currentUser = null;

let zivoData = null;

let currentChatId = null;

let chats = JSON.parse(
  localStorage.getItem("zivo_chats") || "[]"
);

let favorites = JSON.parse(
  localStorage.getItem("zivo_favorites") || "[]"
);

let products = [];


/* ---------- Fallback data ---------- */

const FALLBACK_DATA = {

  site: {
    name: "Zivo",
    description: "پلتفرم آنلاین خرید و فروش کالا"
  },

  ai: {

    name: "Zivo AI",

    answers: [

      {
        keywords: [
          "zivo",
          "زیوو",
          "زیو",
          "چیست",
          "چیه"
        ],

        answer:
          "Zivo یک پلتفرم آنلاین برای خرید و فروش کالا است."
      },

      {
        keywords: [
          "ثبت آگهی",
          "آگهی",
          "فروش",
          "فروختن"
        ],

        answer:
          "برای فروش کالا روی «ثبت آگهی» بزن، اطلاعات محصول را وارد کن و آگهی را ثبت کن."
      },

      {
        keywords: [
          "خرید",
          "محصول",
          "کالا"
        ],

        answer:
          "می‌توانی از قسمت محصولات کالاها را ببینی، جستجو کنی و وارد صفحه جزئیات هر محصول شوی."
      },

      {
        keywords: [
          "گوگل",
          "ورود",
          "ثبت نام",
          "اکانت",
          "حساب"
        ],

        answer:
          "برای ورود یا ثبت‌نام می‌توانی از حساب Google استفاده کنی."
      },

      {
        keywords: [
          "چت",
          "چت جدید",
          "گفتگو",
          "گفت‌وگو"
        ],

        answer:
          "Zivo AI از چند چت جداگانه پشتیبانی می‌کند و چت‌ها در مرورگر ذخیره می‌شوند."
      },

      {
        keywords: [
          "دسته",
          "دسته بندی",
          "دسته‌بندی"
        ],

        answer:
          "دسته‌بندی‌های Zivo شامل موبایل، لپ‌تاپ، گیمینگ، خودرو، خانه و پوشاک است."
      },

      {
        keywords: [
          "تم",
          "تاریک",
          "روشن"
        ],

        answer:
          "با دکمه ماه/خورشید بالای سایت می‌توانی بین حالت تاریک و روشن جابه‌جا شوی."
      }

    ],

    default:
      "من Zivo AI هستم 🤖 درباره خرید، فروش، محصولات، ثبت آگهی یا امکانات Zivo از من بپرس."
  }

};


/* ---------- Products ---------- */

products = [

  {
    id: "p1",

    title: "POCO X7 Pro",

    price: "۲۸,۵۰۰,۰۰۰ تومان",

    category: "موبایل",

    location: "تهران",

    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",

    description:
      "گوشی قدرتمند با نمایشگر AMOLED و عملکرد بالا."
  },


  {
    id: "p2",

    title: "MacBook Pro",

    price: "۹۵,۰۰۰,۰۰۰ تومان",

    category: "لپ‌تاپ",

    location: "تهران",

    image:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",

    description:
      "لپ‌تاپ حرفه‌ای مناسب کار و برنامه‌نویسی."
  },


  {
    id: "p3",

    title: "PS5",

    price: "۴۲,۰۰۰,۰۰۰ تومان",

    category: "گیمینگ",

    location: "اصفهان",

    image:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=80",

    description:
      "کنسول نسل جدید با دسته و تجهیزات کامل."
  },


  {
    id: "p4",

    title: "BMW M4",

    price: "تماس بگیرید",

    category: "خودرو",

    location: "تهران",

    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80",

    description:
      "خودروی اسپرت با طراحی و عملکرد فوق‌العاده."
  },


  {
    id: "p5",

    title: "هدفون بی‌سیم",

    price: "۳,۲۰۰,۰۰۰ تومان",

    category: "لوازم دیجیتال",

    location: "شیراز",

    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",

    description:
      "هدفون بی‌سیم با کیفیت صدای بالا."
  },


  {
    id: "p6",

    title: "صندلی گیمینگ",

    price: "۷,۸۰۰,۰۰۰ تومان",

    category: "گیمینگ",

    location: "مشهد",

    image:
      "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=900&q=80",

    description:
      "صندلی راحت برای بازی و کار طولانی."
  }

];


/* ---------- DOM helpers ---------- */

function $(selector) {
  return document.querySelector(selector);
}


function $$(selector) {
  return [...document.querySelectorAll(selector)];
}


function toast(message) {

  let oldToast = $(".zivo-toast");

  if (oldToast) {
    oldToast.remove();
  }

  const toastElement = document.createElement("div");

  toastElement.className = "zivo-toast";

  toastElement.textContent = message;

  document.body.appendChild(toastElement);

  setTimeout(() => {
    toastElement.classList.add("hide");
  }, 2500);

  setTimeout(() => {
    toastElement.remove();
  }, 3000);
}


/* ---------- Modal ---------- */

function openModal(id) {

  const modal = document.getElementById(id);

  if (!modal) return;

  modal.classList.add("show");

  document.body.style.overflow = "hidden";
}


function closeModal(id) {

  const modal = document.getElementById(id);

  if (!modal) return;

  modal.classList.remove("show");

  document.body.style.overflow = "";
}


function closeAllModals() {

  $$(".modal.show").forEach(modal => {
    modal.classList.remove("show");
  });

  document.body.style.overflow = "";
}


/* ---------- Theme ---------- */

function loadTheme() {

  const theme =
    localStorage.getItem("zivo_theme") || "dark";

  if (theme === "light") {

    document.body.classList.add("light");

  } else {

    document.body.classList.remove("light");

  }

}


function toggleTheme() {

  document.body.classList.toggle("light");

  const isLight =
    document.body.classList.contains("light");

  localStorage.setItem(
    "zivo_theme",
    isLight ? "light" : "dark"
  );

  updateThemeButton();
}


function updateThemeButton() {

  const button = $("#themeBtn");

  if (!button) return;

  button.textContent =
    document.body.classList.contains("light")
      ? "☀️"
      : "🌙";
}


/* ---------- Products ---------- */

function renderProducts(list = products) {

  const container = $("#productsGrid");

  if (!container) return;

  container.innerHTML = "";

  if (!list.length) {

    container.innerHTML = `
      <div class="empty-state">
        محصولی پیدا نشد.
      </div>
    `;

    return;
  }


  list.forEach(product => {

    const isFavorite =
      favorites.includes(product.id);


    const card = document.createElement("article");

    card.className = "product-card";


    card.innerHTML = `

      <div class="product-image">

        <img
          src="${product.image}"
          alt="${product.title}"
          loading="lazy"
        >

        <button
          class="favorite-btn ${isFavorite ? "active" : ""}"
          data-favorite="${product.id}"
          aria-label="افزودن به علاقه‌مندی"
        >
          ${isFavorite ? "♥" : "♡"}
        </button>

      </div>


      <div class="product-content">

        <span class="product-category">
          ${product.category}
        </span>

        <h3>
          ${product.title}
        </h3>

        <p>
          ${product.description}
        </p>

        <div class="product-meta">

          <strong>
            ${product.price}
          </strong>

          <span>
            📍 ${product.location}
          </span>

        </div>

        <button
          class="product-detail-btn"
          data-product="${product.id}"
        >
          مشاهده محصول
        </button>

      </div>
    `;


    container.appendChild(card);

  });


  $$(".favorite-btn").forEach(button => {

    button.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        toggleFavorite(
          button.dataset.favorite
        );

      }
    );

  });


  $$(".product-detail-btn").forEach(button => {

    button.addEventListener(
      "click",
      () => {

        openProduct(
          button.dataset.product
        );

      }
    );

  });

}


/* ---------- Favorite ---------- */

function toggleFavorite(id) {

  if (favorites.includes(id)) {

    favorites =
      favorites.filter(item => item !== id);

    toast("از علاقه‌مندی‌ها حذف شد.");

  } else {

    favorites.push(id);

    toast("به علاقه‌مندی‌ها اضافه شد ❤️");

  }


  localStorage.setItem(
    "zivo_favorites",
    JSON.stringify(favorites)
  );


  renderProducts(
    getCurrentProductList()
  );

}


function getCurrentProductList() {

  const search =
    ($("#searchInput")?.value || "")
      .trim()
      .toLowerCase();


  if (!search) {

    return products;

  }


  return products.filter(product =>

    `${product.title} ${product.category} ${product.location}`
      .toLowerCase()
      .includes(search)

  );

}


/* ---------- Product modal ---------- */

function openProduct(id) {

  const product =
    products.find(item => item.id === id);

  if (!product) return;


  const title = $("#productModalTitle");
  const body = $("#productModalBody");


  if (title) {
    title.textContent = product.title;
  }


  if (body) {

    body.innerHTML = `

      <img
        src="${product.image}"
        alt="${product.title}"
        class="detail-image"
      >

      <div class="detail-info">

        <span>
          ${product.category}
        </span>

        <h2>
          ${product.title}
        </h2>

        <p>
          ${product.description}
        </p>

        <strong>
          ${product.price}
        </strong>

        <p>
          📍 ${product.location}
        </p>

        <button
          class="primary-btn"
          id="detailFavoriteBtn"
        >
          ${
            favorites.includes(product.id)
              ? "♥ حذف از علاقه‌مندی"
              : "♡ افزودن به علاقه‌مندی"
          }
        </button>

      </div>
    `;


    $("#detailFavoriteBtn")
      ?.addEventListener(
        "click",
        () => {

          toggleFavorite(product.id);

          openProduct(product.id);

        }
      );

  }


  openModal("productModal");
}


/* ---------- Search ---------- */

function searchProducts() {

  const list =
    getCurrentProductList();

  renderProducts(list);

}


/* ---------- Category ---------- */

function filterCategory(category) {

  if (category === "all") {

    renderProducts(products);

    return;

  }


  const result =
    products.filter(
      product =>
        product.category === category
    );


  renderProducts(result);

}


/* ---------- AI data ---------- */

async function loadZivoData() {

  try {

    const response =
      await fetch("./data.json", {
        cache: "no-store"
      });


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    zivoData =
      await response.json();


  } catch (error) {

    console.warn(
      "data.json not available. Fallback used.",
      error
    );

    zivoData =
      FALLBACK_DATA;

  }

}


/* ---------- AI ---------- */

function getAIAnswer(text) {

  const clean =
    text
      .toLowerCase()
      .replace(/[؟?!.,]/g, " ")
      .trim();


  const data =
    zivoData?.ai || FALLBACK_DATA.ai;


  for (
    const item of data.answers || []
  ) {

    const matched =
      item.keywords.some(
        keyword =>
          clean.includes(
            keyword.toLowerCase()
          )
      );


    if (matched) {

      return item.answer;

    }

  }


  return (
    data.default ||
    FALLBACK_DATA.ai.default
  );

}


/* ---------- Chats ---------- */

function saveChats() {

  localStorage.setItem(
    "zivo_chats",
    JSON.stringify(chats)
  );

}


function createChat() {

  const chat = {

    id:
      "chat_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .slice(2, 7),

    title: "چت جدید",

    messages: [

      {
        role: "ai",

        text:
          "سلام 👋 من Zivo AI هستم. چطور کمکت کنم؟"
      }

    ]

  };


  chats.unshift(chat);

  currentChatId = chat.id;

  saveChats();

  renderChatList();

  renderCurrentChat();

}


function deleteChat(id) {

  chats =
    chats.filter(
      chat => chat.id !== id
    );


  if (currentChatId === id) {

    currentChatId =
      chats[0]?.id || null;

  }


  saveChats();

  renderChatList();

  renderCurrentChat();

}


function renderChatList() {

  const list =
    $("#chatList");

  if (!list) return;


  list.innerHTML = "";


  chats.forEach(chat => {

    const item =
      document.createElement("div");

    item.className =
      "chat-item " +
      (
        chat.id === currentChatId
          ? "active"
          : ""
      );


    item.innerHTML = `

      <span>
        ${chat.title || "چت"}
      </span>

      <button
        class="chat-delete"
        data-delete-chat="${chat.id}"
      >
        ×
      </button>
    `;


    item.addEventListener(
      "click",
      event => {

        if (
          event.target.closest(
            ".chat-delete"
          )
        ) return;

        currentChatId =
          chat.id;

        renderChatList();

        renderCurrentChat();

      }
    );


    list.appendChild(item);

  });


  $$(".chat-delete").forEach(button => {

    button.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        deleteChat(
          button.dataset.deleteChat
        );

      }
    );

  });

}


function renderCurrentChat() {

  const messagesBox =
    $("#messages");

  if (!messagesBox) return;


  if (!currentChatId) {

    messagesBox.innerHTML = `
      <div class="empty-chat">
        یک چت جدید شروع کن 🤖
      </div>
    `;

    return;

  }


  const chat =
    chats.find(
      item =>
        item.id === currentChatId
    );


  if (!chat) return;


  messagesBox.innerHTML = "";


  chat.messages.forEach(message => {

    const element =
      document.createElement("div");

    element.className =
      "message " +
      (
        message.role === "user"
          ? "user"
          : "ai"
      );


    element.textContent =
      message.text;


    messagesBox.appendChild(element);

  });


  messagesBox.scrollTop =
    messagesBox.scrollHeight;

}


async function sendAIMessage() {

  const input =
    $("#chatInput");

  if (!input) return;


  const text =
    input.value.trim();


  if (!text) return;


  if (!currentChatId) {

    createChat();

  }


  const chat =
    chats.find(
      item =>
        item.id === currentChatId
    );


  if (!chat) return;


  chat.messages.push({

    role: "user",

    text

  });


  if (
    chat.title === "چت جدید"
  ) {

    chat.title =
      text.length > 25
        ? text.slice(0, 25) + "..."
        : text;

  }


  input.value = "";

  saveChats();

  renderChatList();

  renderCurrentChat();


  const answer =
    getAIAnswer(text);


  await new Promise(
    resolve =>
      setTimeout(resolve, 350)
  );


  chat.messages.push({

    role: "ai",

    text: answer

  });


  saveChats();

  renderCurrentChat();

}


/* ---------- Authentication ---------- */

async function loginWithGoogle() {

  if (!auth || !googleProvider) {

    toast(
      "Firebase هنوز آماده نیست."
    );

    return;

  }


  try {

    await signInWithRedirect(
      auth,
      googleProvider
    );

  } catch (error) {

    console.error(error);

    toast(
      "ورود Google انجام نشد."
    );

  }

}


async function logout() {

  if (!auth) return;


  try {

    await signOut(auth);

    toast(
      "از حساب خارج شدی."
    );

  } catch (error) {

    console.error(error);

    toast(
      "خروج انجام نشد."
    );

  }

}


async function handleUser(user) {

  currentUser =
    user || null;


  updateAccountUI();


  if (!user) return;


  try {

    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,

        name:
          user.displayName || "",

        email:
          user.email || "",

        photo:
          user.photoURL || "",

        updatedAt:
          serverTimestamp()
      },
      {
        merge: true
      }
    );

  } catch (error) {

    console.error(
      "Saving user failed:",
      error
    );

  }

}


function updateAccountUI() {

  const accountButton =
    $("#accountBtn");

  if (!accountButton) return;


  if (currentUser) {

    accountButton.textContent =
      "👤";

  } else {

    accountButton.textContent =
      "👤";

  }

}


/* ---------- Sell ad ---------- */

async function submitAd() {

  if (!currentUser) {

    toast(
      "برای ثبت آگهی ابتدا وارد حساب شو."
    );

    closeModal("sellModal");

    openModal("accountModal");

    return;

  }


  const title =
    $("#adTitle")?.value.trim();

  const price =
    $("#adPrice")?.value.trim();

  const category =
    $("#adCategory")?.value;

  const location =
    $("#adLocation")?.value.trim();

  const description =
    $("#adDescription")?.value.trim();


  if (!title || !price || !description) {

    toast(
      "لطفاً اطلاعات آگهی را کامل کن."
    );

    return;

  }


  try {

    await addDoc(
      collection(db, "ads"),
      {

        title,

        price,

        category,

        location,

        description,

        sellerId:
          currentUser.uid,

        sellerName:
          currentUser.displayName || "",

        createdAt:
          serverTimestamp()

      }
    );


    toast(
      "آگهی با موفقیت ثبت شد ✅"
    );


    $("#sellForm")?.reset();

    closeModal("sellModal");


  } catch (error) {

    console.error(error);

    toast(
      "ثبت آگهی انجام نشد."
    );

  }

}


/* ---------- Account modal ---------- */

function showAccount() {

  const name =
    $("#accountName");

  const email =
    $("#accountEmail");

  const loginButton =
    $("#googleLoginBtn");

  const logoutButton =
    $("#logoutBtn");


  if (currentUser) {

    if (name)
      name.textContent =
        currentUser.displayName ||
        "کاربر Zivo";

    if (email)
      email.textContent =
        currentUser.email || "";

    if (loginButton)
      loginButton.style.display =
        "none";

    if (logoutButton)
      logoutButton.style.display =
        "block";

  } else {

    if (name)
      name.textContent =
        "مهمان Zivo";

    if (email)
      email.textContent =
        "برای استفاده کامل وارد شو.";

    if (loginButton)
      loginButton.style.display =
        "block";

    if (logoutButton)
      logoutButton.style.display =
        "none";

  }


  openModal("accountModal");

}


/* ---------- Navigation ---------- */

function scrollToSection(id) {

  const section =
    document.getElementById(id);

  if (!section) return;

  section.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/* ---------- Event listeners ---------- */

function setupEvents() {


  /* Theme 
