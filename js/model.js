// =========================================================
// KONFIGURASI API BACKEND 
// Ganti dengan URL Web App Apps Script milikmu yang baru
// =========================================================
const API_URL = "https://script.google.com/macros/s/AKfycbwyXciqqkL16fiwp6dltjkEukYUqdVyOrn9XbN4CBHC0U5nNgyX2tkkHGftWm81E5nt2g/exec";

class LogistikModel {
  static async fetchAPI(action, payload = {}) {
    try {
      // Menggunakan URL object agar aman dari karakter tersembunyi / spasi Safari iOS
      const cleanUrl = API_URL.trim();
      const urlObj = new URL(cleanUrl);
      
      const response = await fetch(urlObj.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        redirect: 'follow',
        body: JSON.stringify({ action: action, data: payload })
      });
      
      return await response.json();
    } catch (error) {
      console.error("Network Error:", error);
      return { status: 'error', message: 'Koneksi ke server gagal: ' + error.message };
    }
  }

  static async getAppData() {
    return await this.fetchAPI('getAppData');
  }

  static async login(password) {
    return await this.fetchAPI('login', { password: password });
  }

  static async simpanTransaksi(tipe, formData) {
    const actionPath = tipe === 'keluar' ? 'simpanBarangKeluar' : 'simpanBarangMasuk';
    return await this.fetchAPI(actionPath, formData);
  }

  static async simpanMaster(tipe, formData) {
    const actionPath = tipe === 'barang' ? 'simpanMasterBarang' : (tipe === 'supplier' ? 'simpanSupplier' : 'simpanDepartemen');
    return await this.fetchAPI(actionPath, formData);
  }

  static async hapusRecord(sheetName, kode) {
    return await this.fetchAPI('hapusData', { sheetName, kode });
  }
}
