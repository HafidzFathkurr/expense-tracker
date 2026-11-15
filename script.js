// ===== 1. MENGAMBIL ELEMEN DARI HTML =====
// document.getElementById("...") mengambil elemen berdasarkan id-nya.
// Hasilnya disimpan ke variabel agar bisa dipakai berulang kali.
const form = document.getElementById("transaction-form");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");


// ===== 2. MENGISI TANGGAL OTOMATIS =====
// Fungsi ini mengisi kolom tanggal dengan tanggal hari ini,
// jadi pengguna tidak perlu mengisinya manual.
function setTodayDate() {
  const today = new Date();                      // tanggal & waktu sekarang
  const year = today.getFullYear();              // contoh: 2026
  const month = String(today.getMonth() + 1).padStart(2, "0"); // bulan (0-11, jadi ditambah 1)
  const day = String(today.getDate()).padStart(2, "0");        // tanggal

  // Format yang dibutuhkan input type="date" adalah YYYY-MM-DD
  dateInput.value = `${year}-${month}-${day}`;
}


// ===== 3. FUNGSI MENANGANI FORM =====
// Fungsi ini dijalankan setiap kali form disubmit (tombol Simpan ditekan).
function handleFormSubmit(event) {
  // Secara bawaan, form akan me-refresh halaman saat disubmit.
  // preventDefault() mencegah hal itu.
  event.preventDefault();

  // Membaca nilai dari setiap kolom.
  // .trim() membuang spasi di awal & akhir teks.
  const type = typeInput.value;
  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);      // diubah dari teks menjadi angka
  const category = categoryInput.value;
  const date = dateInput.value;

  // ----- VALIDASI -----
  // Pastikan deskripsi tidak kosong
  if (description === "") {
    alert("Deskripsi tidak boleh kosong!");
    return; // return menghentikan fungsi di sini
  }

  // Pastikan nominal berupa angka dan lebih dari 0
  if (amount <= 0 || isNaN(amount)) {
    alert("Nominal harus lebih dari 0!");
    return;
  }

  // Pastikan tanggal sudah diisi
  if (date === "") {
    alert("Tanggal harus diisi!");
    return;
  }

  // ----- MEMBUAT OBJEK TRANSAKSI -----
  // Objek adalah "paket data" yang berisi beberapa informasi sekaligus.
  const transaction = {
    id: Date.now(),        // id unik, memakai waktu saat ini dalam milidetik
    type: type,            // "income" atau "expense"
    description: description,
    amount: amount,
    category: category,
    date: date
  };

  // Untuk sementara, tampilkan di Console sebagai bukti data terbaca.
  console.log("Transaksi baru:", transaction);

  // ----- MEMBERSIHKAN FORM -----
  // Setelah berhasil, kosongkan kolom agar siap untuk input berikutnya.
  descriptionInput.value = "";
  amountInput.value = "";
  setTodayDate();
}


// ===== 4. MENYAMBUNGKAN FORM DENGAN FUNGSI =====
// addEventListener = "dengarkan" sebuah kejadian.
// Ketika kejadian "submit" terjadi pada form, jalankan handleFormSubmit.
form.addEventListener("submit", handleFormSubmit);


// ===== 5. MENJALANKAN SAAT HALAMAN DIMUAT =====
setTodayDate();
console.log("Expense Tracker siap digunakan! 🚀");