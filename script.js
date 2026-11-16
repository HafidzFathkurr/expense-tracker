// ===== 1. MENGAMBIL ELEMEN DARI HTML =====
const form = document.getElementById("transaction-form");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");


// ===== 2. PENGATURAN PENYIMPANAN (BARU) =====
// STORAGE_KEY adalah "nama laci" tempat data kita disimpan di LocalStorage.
// Pakai nama yang khas supaya tidak bentrok dengan proyek lain.
const STORAGE_KEY = "expense-tracker-transactions";

// Membaca data dari LocalStorage.
// Jika belum ada data (pertama kali dibuka), kembalikan array kosong.
function loadTransactions() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  // Belum pernah menyimpan apa pun
  if (savedData === null) {
    return [];
  }

  // LocalStorage hanya menyimpan TEKS, jadi teks diubah kembali
  // menjadi array dengan JSON.parse().
  // try...catch dipakai supaya aplikasi tidak rusak jika datanya korup.
  try {
    return JSON.parse(savedData);
  } catch (error) {
    console.error("Data di LocalStorage rusak, memulai dari kosong.", error);
    return [];
  }
}

// Menyimpan array transactions ke LocalStorage.
function saveTransactions() {
  // JSON.stringify() mengubah array menjadi teks agar bisa disimpan.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}


// ===== 3. DATA UTAMA APLIKASI (BARU) =====
// Array ini berisi semua transaksi. Saat halaman dibuka,
// isinya langsung diambil dari LocalStorage.
let transactions = loadTransactions();


// ===== 4. MENGISI TANGGAL OTOMATIS =====
function setTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  dateInput.value = `${year}-${month}-${day}`;
}


// ===== 5. FUNGSI MENANGANI FORM =====
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

  // ----- MENYIMPAN TRANSAKSI (BARU) -----
  // push() menambahkan transaksi baru ke akhir array.
  transactions.push(transaction);

  // Simpan array terbaru ke LocalStorage.
  saveTransactions();

  console.log("Transaksi disimpan:", transaction);
  console.log("Jumlah transaksi sekarang:", transactions.length);

  // ----- MEMBERSIHKAN FORM -----
  descriptionInput.value = "";
  amountInput.value = "";
  setTodayDate();
}


// ===== 6. MENYAMBUNGKAN FORM DENGAN FUNGSI =====
form.addEventListener("submit", handleFormSubmit);


// ===== 7. MENJALANKAN SAAT HALAMAN DIMUAT =====
setTodayDate();
console.log("Expense Tracker siap digunakan! 🚀");
console.log("Data dimuat dari LocalStorage:", transactions.length, "transaksi");