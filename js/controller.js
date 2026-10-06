let appDataCache = null;
let modalBarangUI, modalSupplierUI, modalDepartemenUI;
let tsBarangKeluar, tsBarangMasuk, tsSupplier;

class LogistikController {
  static async init() {
    modalBarangUI = new bootstrap.Modal(document.getElementById('modalBarang'));
    modalSupplierUI = new bootstrap.Modal(document.getElementById('modalSupplier'));
    modalDepartemenUI = new bootstrap.Modal(document.getElementById('modalDepartemen'));

    await this.muatUlangData();
    this.setupEventListeners();
  }

  static async muatUlangData() {
    LogistikView.tampilkanLoading('Sinkronisasi Data...');
    const res = await LogistikModel.getAppData();
    LogistikView.tutupLoading();

    if (res.status === 'success') {
      appDataCache = res.data;
      LogistikView.renderSemuaData(appDataCache);
      this.inisialisasiTomSelect();
    } else {
      LogistikView.notifikasi('error', 'Gagal', res.message);
    }
  }

  static inisialisasiTomSelect() {
    if (tsBarangKeluar) tsBarangKeluar.destroy(); 
    if (tsBarangMasuk) tsBarangMasuk.destroy(); 
    if (tsSupplier) tsSupplier.destroy();
    
    const tsConf = { create: false, maxOptions: 500 };
    tsBarangKeluar = new TomSelect('#k_kode', tsConf); 
    tsBarangMasuk = new TomSelect('#m_kode_masuk', tsConf); 
    tsSupplier = new TomSelect('#m_supplier', tsConf);
  }

  static setupEventListeners() {
    // Tombol Login
    document.getElementById('btnLoginTrigger').addEventListener('click', async () => {
      const { value: password } = await Swal.fire({
        title: 'Verifikasi Admin', input: 'password', inputPlaceholder: 'Masukkan sandi...',
        showCancelButton: true, confirmButtonText: 'Masuk', confirmButtonColor: '#3b82f6'
      });
      if (password) {
        LogistikView.tampilkanLoading('Memeriksa...');
        const res = await LogistikModel.login(password);
        LogistikView.tutupLoading();
        if (res.status === 'success') {
          LogistikView.alihkanKeAdmin();
        } else {
          LogistikView.notifikasi('error', 'Akses Ditolak', res.message);
        }
      }
    });

    // Tombol Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
      LogistikView.alihkanKePublik();
    });

    // Form Barang Keluar
    document.getElementById('formBarangKeluar').addEventListener('submit', async (e) => {
      e.preventDefault();
      const dataForm = {
        kodeBarang: $('#k_kode').val(), jumlah: $('#k_jumlah').val(),
        departemen: $('#k_dept').val(), keterangan: $('#k_ket').val()
      };
      LogistikView.tampilkanLoading('Menyimpan Transaksi...');
      const res = await LogistikModel.simpanTransaksi('keluar', dataForm);
      LogistikView.tutupLoading();

      if (res.status === 'success') {
        LogistikView.notifikasi('success', 'Berhasil', res.message);
        e.target.reset();
        if (tsBarangKeluar) tsBarangKeluar.clear();
        await this.muatUlangData();
      } else {
        LogistikView.notifikasi('error', 'Gagal', res.message);
      }
    });

    // Form Barang Masuk
    document.getElementById('formBarangMasuk').addEventListener('submit', async (e) => {
      e.preventDefault();
      const dataForm = {
        kodeBarang: $('#m_kode_masuk').val(), jumlah: $('#m_jumlah_masuk').val(),
        supplier: $('#m_supplier').val(), keterangan: $('#m_ket_masuk').val()
      };
      LogistikView.tampilkanLoading('Menyimpan Transaksi...');
      const res = await LogistikModel.simpanTransaksi('masuk', dataForm);
      LogistikView.tutupLoading();

      if (res.status === 'success') {
        LogistikView.notifikasi('success', 'Berhasil', res.message);
        e.target.reset();
        if (tsBarangMasuk) tsBarangMasuk.clear();
        if (tsSupplier) tsSupplier.clear();
        await this.muatUlangData();
      } else {
        LogistikView.notifikasi('error', 'Gagal', res.message);
      }
    });

    // Form Master Barang
    document.getElementById('formBarang').addEventListener('submit', async (e) => {
      e.preventDefault();
      const dt = {
        mode: $('#barangMode').val(), kode: $('#b_kode').val(), nama: $('#b_nama').val(),
        merek: $('#b_merek').val(), satuan: $('#b_satuan').val(), stok: $('#b_stok').val(),
        minStok: $('#b_min').val(), peruntukan: $('#b_dept').val()
      };
      LogistikView.tampilkanLoading('Menyimpan Barang...');
      const res = await LogistikModel.simpanMaster('barang', dt);
      LogistikView.tutupLoading();

      if (res.status === 'success') {
        modalBarangUI.hide();
        LogistikView.notifikasi('success', 'Berhasil', res.message);
        await this.muatUlangData();
      } else {
        LogistikView.notifikasi('error', 'Gagal', res.message);
      }
    });

    // Form Supplier
    document.getElementById('formSupplier').addEventListener('submit', async (e) => {
      e.preventDefault();
      const dt = {
        mode: $('#supplierMode').val(), kode: $('#s_kode').val(), nama: $('#s_nama').val(),
        spesifikasi: $('#s_spek').val(), telp: $('#s_telp').val(), alamat: $('#s_alamat').val(), keterangan: $('#s_ket').val()
      };
      LogistikView.tampilkanLoading('Menyimpan Supplier...');
      const res = await LogistikModel.simpanMaster('supplier', dt);
      LogistikView.tutupLoading();

      if (res.status === 'success') {
        modalSupplierUI.hide();
        LogistikView.notifikasi('success', 'Berhasil', res.message);
        await this.muatUlangData();
      } else {
        LogistikView.notifikasi('error', 'Gagal', res.message);
      }
    });

    // Form Departemen
    document.getElementById('formDepartemen').addEventListener('submit', async (e) => {
      e.preventDefault();
      const dt = {
        mode: $('#departemenMode').val(), kode: $('#d_kode').val(), nama: $('#d_nama').val()
      };
      LogistikView.tampilkanLoading('Menyimpan Departemen...');
      const res = await LogistikModel.simpanMaster('departemen', dt);
      LogistikView.tutupLoading();

      if (res.status === 'success') {
        modalDepartemenUI.hide();
        LogistikView.notifikasi('success', 'Berhasil', res.message);
        await this.muatUlangData();
      } else {
        LogistikView.notifikasi('error', 'Gagal', res.message);
      }
    });
  }

  // Modal Triggers
  static bukaModalBarang(mode, kode = '') {
    document.getElementById('formBarang').reset(); 
    const inputKode = document.getElementById('b_kode');
    $('#b_stok').val(0); $('#b_min').val(0); $('#b_dept').val('Umum');
    if (mode === 'tambah') {
      $('#barangMode').val('tambah'); $('#titleBarang').text('Tambah Barang'); inputKode.readOnly = false; modalBarangUI.show();
    } else {
      const item = appDataCache.stok.find(x => x.kode === kode); 
      if (!item) return;
      $('#barangMode').val('edit'); $('#titleBarang').text('Edit Barang'); 
      inputKode.value = item.kode; inputKode.readOnly = true;
      $('#b_nama').val(item.nama); $('#b_merek').val(item.merek); $('#b_satuan').val(item.satuan); 
      $('#b_stok').val(item.stok); $('#b_min').val(item.minStok); $('#b_dept').val(item.peruntukan || 'Umum');
      modalBarangUI.show();
    }
  }

  static bukaModalSupplier(mode, kode = '') {
    document.getElementById('formSupplier').reset(); 
    const inputKode = document.getElementById('s_kode');
    if (mode === 'tambah') { 
      $('#supplierMode').val('tambah'); $('#titleSupplier').text('Tambah Supplier'); inputKode.readOnly = false; modalSupplierUI.show(); 
    } else {
      const it = appDataCache.supplier.find(x => x.kode === kode); 
      if (!it) return;
      $('#supplierMode').val('edit'); $('#titleSupplier').text('Edit Supplier'); 
      inputKode.value = it.kode; inputKode.readOnly = true; 
      $('#s_nama').val(it.nama); $('#s_spek').val(it.spesifikasi); 
      $('#s_telp').val(it.telp); $('#s_alamat').val(it.alamat); $('#s_ket').val(it.keterangan); modalSupplierUI.show();
    }
  }

  static bukaModalDepartemen(mode, kode = '') {
    document.getElementById('formDepartemen').reset(); 
    const inputKode = document.getElementById('d_kode');
    if (mode === 'tambah') { 
      $('#departemenMode').val('tambah'); $('#titleDepartemen').text('Tambah Departemen'); inputKode.readOnly = false; modalDepartemenUI.show(); 
    } else {
      const it = appDataCache.departemen.find(x => x.kode === kode); 
      if (!it) return;
      $('#departemenMode').val('edit'); $('#titleDepartemen').text('Edit Departemen'); 
      inputKode.value = it.kode; inputKode.readOnly = true; $('#d_nama').val(it.nama); modalDepartemenUI.show();
    }
  }

  static async konfirmasiHapus(sheetName, kode) {
    const resConf = await Swal.fire({ 
      title: 'Hapus Data?', text: `Menghapus "${kode}" permanen.`, icon: 'warning', 
      showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Hapus!' 
    });
    if (!resConf.isConfirmed) return;
    
    LogistikView.tampilkanLoading('Menghapus...');
    const res = await LogistikModel.hapusRecord(sheetName, kode);
    LogistikView.tutupLoading();

    if (res.status === 'success') { 
      LogistikView.notifikasi('success', 'Terhapus!', res.message); 
      await this.muatUlangData(); 
    } else {
      LogistikView.notifikasi('error', 'Gagal', res.message);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  LogistikController.init();
});