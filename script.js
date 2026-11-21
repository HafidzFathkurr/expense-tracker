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
// BARU: elemen yang berubah saat masuk mode edit
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-btn");
const cancelButton = document.getElementById("cancel-btn");


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

// BARU: menyimpan id transaksi yang sedang diedit.
// Nilai null artinya form sedang dalam mode "tambah" (bukan edit).
let editingId = null;


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


// ===== 9. MODE EDIT (BARU) =====

// Mengembalikan form ke kondisi awal (mode "tambah").
function resetForm() {
  editingId = null;                  // tidak ada lagi yang sedang diedit

  typeInput.value = "income";        // kembalikan pilihan ke default
  descriptionInput.value = "";
  amountInput.value = "";
  categoryInput.selectedIndex = 0;   // pilih kategori pertama di daftar
  setTodayDate();

  // Kembalikan teks dan tombol seperti semula
  formTitle.textContent = "Tambah Transaksi";
  submitButton.textContent = "Simpan Transaksi";
  cancelButton.classList.add("hidden");   // sembunyikan tombol Batal
}

// Memasukkan data transaksi ke form agar bisa diubah.
function startEdit(id) {
  // find() mencari SATU transaksi yang id-nya cocok.
  // Hasilnya adalah objek transaksi itu sendiri (atau undefined jika tidak ada).
  const transaction = transactions.find(function (item) {
    return item.id === id;
  });

  // Pengaman: jika tidak ketemu, hentikan fungsi
  if (!transaction) {
    return;
  }

  // Isi form dengan data transaksi yang dipilih
  typeInput.value = transaction.type;
  descriptionInput.value = transaction.description;
  amountInput.value = transaction.amount;
  categoryInput.value = transaction.category;
  dateInput.value = transaction.date;

  // Catat id yang sedang diedit
  editingId = id;

  // Ubah tampilan form menjadi mode edit
  formTitle.textContent = "Edit Transaksi";
  submitButton.textContent = "Perbarui Transaksi";
  cancelButton.classList.remove("hidden");   // tampilkan tombol Batal

  // Gulir halaman ke form agar langsung terlihat (berguna di HP)
  form.scrollIntoView({ behavior: "smooth" });
}


// ===== 10. MENGHAPUS TRANSAKSI =====
function deleteTransaction(id) {
  const isSure = confirm("Yakin ingin menghapus transaksi ini?");

  if (!isSure) {
    return;
  }

  transactions = transactions.filter(function (transaction) {
    return transaction.id !== id;
  });

  saveTransactions();

  // BARU: jika transaksi yang dihapus sedang diedit, keluar dari mode edit
  if (editingId === id) {
    resetForm();
  }

  refreshView();
}


// ===== 11. FUNGSI MENANGANI FORM (DIPERBARUI) =====
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

  // ----- PILIH: MODE TAMBAH ATAU MODE EDIT? -----
  if (editingId === null) {
    // MODE TAMBAH: buat transaksi baru
    const transaction = {
      id: Date.now(),
      type: type,
      description: description,
      amount: amount,
      category: category,
      date: date
    };

    transactions.push(transaction);

  } else {
    // MODE EDIT: cari transaksi lama, lalu ganti isinya.
    // Id TIDAK diubah, supaya tetap transaksi yang sama.
    const transaction = transactions.find(function (item) {
      return item.id === editingId;
    });

    transaction.type = type;
    transaction.description = description;
    transaction.amount = amount;
    transaction.category = category;
    transaction.date = date;
  }

  // ----- SIMPAN, TAMPILKAN ULANG, DAN BERSIHKAN FORM -----
  saveTransactions();
  refreshView();
  resetForm();
}


// ===== 12. MENANGANI KLIK PADA DAFTAR TRANSAKSI (DIPERBARUI) =====
function handleListClick(event) {
  const clickedElement = event.target;

  // Tombol Hapus
  if (clickedElement.classList.contains("delete-btn")) {
    const id = Number(clickedElement.dataset.id);
    deleteTransaction(id);
  }

  // BARU: Tombol Edit
  if (clickedElement.classList.contains("edit-btn")) {
    const id = Number(clickedElement.dataset.id);
    startEdit(id);
  }
}


// ===== 13. MENYAMBUNGKAN KEJADIAN DENGAN FUNGSI =====
form.addEventListener("submit", handleFormSubmit);
transactionList.addEventListener("click", handleListClick);
cancelButton.addEventListener("click", resetForm); // BARU: Batal = kembali ke mode tambah


// ===== 14. MENJALANKAN SAAT HALAMAN DIMUAT =====
setTodayDate();
refreshView();