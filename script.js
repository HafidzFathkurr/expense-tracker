// ===== 1. MENGAMBIL ELEMEN DARI HTML =====
const form = document.getElementById("transaction-form");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const transactionList = document.getElementById("transaction-list");
// BARU: tiga kartu ringkasan di bagian atas
const balanceElement = document.getElementById("balance");
const totalIncomeElement = document.getElementById("total-income");
const totalExpenseElement = document.getElementById("total-expense");


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


// ===== 5. FUNGSI PEMBANTU UNTUK FORMAT =====

// Mengubah angka menjadi format Rupiah.
// DIPERBARUI: sekarang bisa menampilkan angka minus dengan benar.
// Contoh: 25000 -> "Rp 25.000", -5000 -> "-Rp 5.000"
function formatRupiah(number) {
  // Jika angka minus, siapkan tanda "-" di depan
  const sign = number < 0 ? "-" : "";

  // Math.abs() mengubah angka minus menjadi plus (nilai mutlak)
  return sign + "Rp " + Math.abs(number).toLocaleString("id-ID");
}

function formatDate(dateString) {
  const parts = dateString.split("-");
  const date = new Date(parts[0], parts[1] - 1, parts[2]);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}


// ===== 6. MENAMPILKAN RIWAYAT TRANSAKSI =====
function createTransactionItem(transaction) {
  const item = document.createElement("li");
  item.className = "transaction " + transaction.type;

  const info = document.createElement("div");
  info.className = "transaction-info";

  const title = document.createElement("strong");
  title.textContent = transaction.description;

  const detail = document.createElement("small");
  detail.textContent = `${transaction.category} • ${formatDate(transaction.date)}`;

  info.appendChild(title);
  info.appendChild(detail);

  const amount = document.createElement("span");
  amount.className = "transaction-amount";
  const sign = transaction.type === "income" ? "+" : "-";
  amount.textContent = `${sign} ${formatRupiah(transaction.amount)}`;

  const actions = document.createElement("div");
  actions.className = "transaction-actions";

  const editButton = document.createElement("button");
  editButton.className = "btn btn-small edit-btn";
  editButton.textContent = "Edit";
  editButton.dataset.id = transaction.id;

  const deleteButton = document.createElement("button");
  deleteButton.className = "btn btn-small btn-danger delete-btn";
  deleteButton.textContent = "Hapus";
  deleteButton.dataset.id = transaction.id;

  actions.appendChild(editButton);
  actions.appendChild(deleteButton);

  item.appendChild(info);
  item.appendChild(amount);
  item.appendChild(actions);

  return item;
}

function renderTransactions() {
  transactionList.innerHTML = "";

  if (transactions.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = "Belum ada transaksi. Yuk, tambahkan yang pertama!";
    transactionList.appendChild(emptyMessage);
    return;
  }

  const sortedTransactions = [...transactions].sort(function (a, b) {
    return b.date.localeCompare(a.date) || b.id - a.id;
  });

  sortedTransactions.forEach(function (transaction) {
    transactionList.appendChild(createTransactionItem(transaction));
  });
}


// ===== 7. MENGHITUNG DAN MENAMPILKAN RINGKASAN (BARU) =====
function updateSummary() {
  // Mulai dari 0, lalu tambahkan nominal satu per satu
  let totalIncome = 0;
  let totalExpense = 0;

  // Periksa setiap transaksi: pemasukan atau pengeluaran?
  transactions.forEach(function (transaction) {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;   // += artinya "tambahkan ke nilai sebelumnya"
    } else {
      totalExpense += transaction.amount;
    }
  });

  // Saldo = total pemasukan dikurangi total pengeluaran
  const balance = totalIncome - totalExpense;

  // Tampilkan hasilnya ke kartu di halaman
  balanceElement.textContent = formatRupiah(balance);
  totalIncomeElement.textContent = formatRupiah(totalIncome);
  totalExpenseElement.textContent = formatRupiah(totalExpense);

  // Jika saldo minus, beri class "negative" agar tulisannya merah.
  // toggle(nama, kondisi): tambahkan class jika kondisi benar, hapus jika salah.
  balanceElement.classList.toggle("negative", balance < 0);
}


// ===== 8. MEMPERBARUI TAMPILAN (BARU) =====
// Satu fungsi yang memperbarui riwayat DAN ringkasan sekaligus.
// Setiap kali data berubah (tambah, hapus, edit), cukup panggil fungsi ini.
function refreshView() {
  renderTransactions();
  updateSummary();
}


// ===== 9. FUNGSI MENANGANI FORM =====
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

  // DIPERBARUI: perbarui riwayat dan ringkasan sekaligus
  refreshView();

  // ----- MEMBERSIHKAN FORM -----
  descriptionInput.value = "";
  amountInput.value = "";
  setTodayDate();
}


// ===== 10. MENYAMBUNGKAN FORM DENGAN FUNGSI =====
form.addEventListener("submit", handleFormSubmit);


// ===== 11. MENJALANKAN SAAT HALAMAN DIMUAT =====
setTodayDate();
refreshView(); // DIPERBARUI: tampilkan riwayat dan ringkasan dari data tersimpan