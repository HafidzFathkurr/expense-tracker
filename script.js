// ===== 1. MENGAMBIL ELEMEN DARI HTML =====
const form = document.getElementById("transaction-form");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
// BARU: daftar tempat riwayat transaksi ditampilkan
const transactionList = document.getElementById("transaction-list");


// ===== 2. PENGATURAN PENYIMPANAN =====
const STORAGE_KEY = "expense-tracker-transactions";

function loadTransactions() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (savedData === null) {
    return [];
  }

  try {
    return JSON.parse(savedData);
  } catch (error) {
    console.error("Data di LocalStorage rusak, memulai dari kosong.", error);
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}


// ===== 3. DATA UTAMA APLIKASI =====
let transactions = loadTransactions();


// ===== 4. MENGISI TANGGAL OTOMATIS =====
function setTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  dateInput.value = `${year}-${month}-${day}`;
}


// ===== 5. FUNGSI PEMBANTU UNTUK FORMAT (BARU) =====

// Mengubah angka menjadi format Rupiah. Contoh: 25000 -> "Rp 25.000"
function formatRupiah(number) {
  // toLocaleString("id-ID") menambahkan titik pemisah ribuan ala Indonesia
  return "Rp " + number.toLocaleString("id-ID");
}

// Mengubah tanggal "2026-11-17" menjadi "17 Nov 2026"
function formatDate(dateString) {
  // split("-") memecah teks menjadi bagian: ["2026", "11", "17"]
  const parts = dateString.split("-");

  // new Date(tahun, bulan, tanggal). Bulan dimulai dari 0, jadi dikurangi 1.
  const date = new Date(parts[0], parts[1] - 1, parts[2]);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}


// ===== 6. MENAMPILKAN RIWAYAT TRANSAKSI (BARU) =====

// Membuat SATU baris transaksi (elemen <li>) dari satu data transaksi.
function createTransactionItem(transaction) {
  // Elemen utama. Class "income" atau "expense" mengatur warna garis kiri.
  const item = document.createElement("li");
  item.className = "transaction " + transaction.type;

  // --- Bagian kiri: deskripsi, kategori, dan tanggal ---
  const info = document.createElement("div");
  info.className = "transaction-info";

  const title = document.createElement("strong");
  title.textContent = transaction.description;

  const detail = document.createElement("small");
  detail.textContent = `${transaction.category} • ${formatDate(transaction.date)}`;

  info.appendChild(title);
  info.appendChild(detail);

  // --- Bagian tengah: nominal ---
  const amount = document.createElement("span");
  amount.className = "transaction-amount";
  const sign = transaction.type === "income" ? "+" : "-";
  amount.textContent = `${sign} ${formatRupiah(transaction.amount)}`;

  // --- Bagian kanan: tombol Edit dan Hapus (belum berfungsi) ---
  const actions = document.createElement("div");
  actions.className = "transaction-actions";

  const editButton = document.createElement("button");
  editButton.className = "btn btn-small edit-btn";
  editButton.textContent = "Edit";
  editButton.dataset.id = transaction.id; // menyimpan id untuk dipakai nanti

  const deleteButton = document.createElement("button");
  deleteButton.className = "btn btn-small btn-danger delete-btn";
  deleteButton.textContent = "Hapus";
  deleteButton.dataset.id = transaction.id;

  actions.appendChild(editButton);
  actions.appendChild(deleteButton);

  // Gabungkan semua bagian ke dalam <li>
  item.appendChild(info);
  item.appendChild(amount);
  item.appendChild(actions);

  return item;
}

// Menampilkan seluruh transaksi ke halaman.
function renderTransactions() {
  // Kosongkan daftar dulu agar tidak terjadi data ganda
  transactionList.innerHTML = "";

  // Jika belum ada transaksi, tampilkan pesan kosong
  if (transactions.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = "Belum ada transaksi. Yuk, tambahkan yang pertama!";
    transactionList.appendChild(emptyMessage);
    return; // berhenti di sini
  }

  // Urutkan dari tanggal terbaru. Jika tanggalnya sama, id terbesar (paling baru dibuat) di atas.
  // [...transactions] membuat salinan agar urutan array asli tidak ikut berubah.
  const sortedTransactions = [...transactions].sort(function (a, b) {
    return b.date.localeCompare(a.date) || b.id - a.id;
  });

  // Untuk setiap transaksi, buat baris lalu masukkan ke daftar
  sortedTransactions.forEach(function (transaction) {
    transactionList.appendChild(createTransactionItem(transaction));
  });
}


// ===== 7. FUNGSI MENANGANI FORM =====
function handleFormSubmit(event) {
  event.preventDefault();

  const type = typeInput.value;
  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  // ----- VALIDASI -----
  if (description === "") {
    alert("Deskripsi tidak boleh kosong!");
    return;
  }

  if (amount <= 0 || isNaN(amount)) {
    alert("Nominal harus lebih dari 0!");
    return;
  }

  if (date === "") {
    alert("Tanggal harus diisi!");
    return;
  }

  // ----- MEMBUAT OBJEK TRANSAKSI -----
  const transaction = {
    id: Date.now(),
    type: type,
    description: description,
    amount: amount,
    category: category,
    date: date
  };

  // ----- MENYIMPAN TRANSAKSI -----
  transactions.push(transaction);
  saveTransactions();

  // BARU: tampilkan ulang riwayat agar transaksi baru langsung muncul
  renderTransactions();

  // ----- MEMBERSIHKAN FORM -----
  descriptionInput.value = "";
  amountInput.value = "";
  setTodayDate();
}


// ===== 8. MENYAMBUNGKAN FORM DENGAN FUNGSI =====
form.addEventListener("submit", handleFormSubmit);


// ===== 9. MENJALANKAN SAAT HALAMAN DIMUAT =====
setTodayDate();
renderTransactions(); // BARU: tampilkan data yang tersimpan saat halaman dibuka