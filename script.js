// ===== 1. MENGAMBIL ELEMEN DARI HTML =====
const form = document.getElementById("transaction-form");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const transactionList = document.getElementById("transaction-list");
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
function formatRupiah(number) {
  const sign = number < 0 ? "-" : "";
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


// ===== 7. MENGHITUNG DAN MENAMPILKAN RINGKASAN =====
function updateSummary() {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(function (transaction) {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  });

  const balance = totalIncome - totalExpense;

  balanceElement.textContent = formatRupiah(balance);
  totalIncomeElement.textContent = formatRupiah(totalIncome);
  totalExpenseElement.textContent = formatRupiah(totalExpense);

  balanceElement.classList.toggle("negative", balance < 0);
}


// ===== 8. MEMPERBARUI TAMPILAN =====
function refreshView() {
  renderTransactions();
  updateSummary();
}


// ===== 9. MENGHAPUS TRANSAKSI (BARU) =====
function deleteTransaction(id) {
  // confirm() menampilkan kotak pertanyaan Ya/Batal.
  // Hasilnya true jika pengguna menekan OK, false jika Batal.
  const isSure = confirm("Yakin ingin menghapus transaksi ini?");

  // Jika pengguna menekan Batal, hentikan fungsi
  if (!isSure) {
    return;
  }

  // filter() membuat array BARU yang hanya berisi transaksi
  // yang id-nya TIDAK sama dengan id yang ingin dihapus.
  // Artinya, transaksi dengan id tersebut "tersaring" keluar.
  transactions = transactions.filter(function (transaction) {
    return transaction.id !== id;
  });

  // Simpan array terbaru ke LocalStorage, lalu perbarui tampilan
  saveTransactions();
  refreshView();
}


// ===== 10. FUNGSI MENANGANI FORM =====
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
  refreshView();

  // ----- MEMBERSIHKAN FORM -----
  descriptionInput.value = "";
  amountInput.value = "";
  setTodayDate();
}


// ===== 11. MENANGANI KLIK PADA DAFTAR TRANSAKSI (BARU) =====
// Tombol Hapus dibuat ulang setiap kali daftar digambar, jadi kita tidak
// memasang pendengar di tiap tombol. Cukup satu pendengar di daftarnya saja.
// Teknik ini disebut "event delegation".
function handleListClick(event) {
  // event.target adalah elemen yang benar-benar diklik
  const clickedElement = event.target;

  // Apakah yang diklik adalah tombol Hapus?
  if (clickedElement.classList.contains("delete-btn")) {
    // dataset.id berupa teks, jadi diubah menjadi angka agar cocok dengan id transaksi
    const id = Number(clickedElement.dataset.id);
    deleteTransaction(id);
  }

  // Tombol Edit akan ditangani di Tahap 7
}


// ===== 12. MENYAMBUNGKAN KEJADIAN DENGAN FUNGSI =====
form.addEventListener("submit", handleFormSubmit);
transactionList.addEventListener("click", handleListClick); // BARU


// ===== 13. MENJALANKAN SAAT HALAMAN DIMUAT =====
setTodayDate();
refreshView();