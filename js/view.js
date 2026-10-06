class LogistikView {
  static formatAngka(angka) {
    const nilai = Number(angka);
    return Number.isFinite(nilai) ? new Intl.NumberFormat('id-ID').format(nilai) : '0';
  }

  static tampilkanLoading(pesan) {
    Swal.fire({
      title: pesan,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
  }

  static tutupLoading() {
    Swal.close();
  }

  static notifikasi(tipe, judul, pesan) {
    Swal.fire({ icon: tipe, title: judul, text: pesan, timer: tipe === 'success' ? 1500 : undefined, showConfirmButton: tipe !== 'success' });
  }

  static renderSemuaData(db) {
    const tableIds = ['#tablePublicBarang', '#tableMasterBarang', '#tableSupplier', '#tableDepartemen', '#tableHistoriKeluar', '#tableHistoriMasuk'];
    tableIds.forEach(id => { if ($.fn.DataTable.isDataTable(id)) $(id).DataTable().destroy(); });

    // 1. Publik & Master Barang
    let tbodyPub = '', tbodyAdm = '', optBarang = '<option value="">-- Ketik Nama atau Kode --</option>';
    db.stok.forEach(item => {
      const isCrit = Number(item.stok) <= Number(item.minStok);
      const status = isCrit ? '<span class="badge-soft-danger">Kritis</span>' : '<span class="badge-soft-success">Aman</span>';
      const txtStok = isCrit ? `<span class="text-danger fw-bold">${this.formatAngka(item.stok)} ${item.satuan}</span>` : `<b>${this.formatAngka(item.stok)}</b> <span class="text-muted">${item.satuan}</span>`;
      
      tbodyPub += `<tr><td><span class="text-primary fw-bold">${item.kode}</span></td><td><b>${item.nama}</b><br><small class="text-muted">${item.merek || '-'}</small></td><td><span class="badge-dept">${item.peruntukan}</span></td><td>${txtStok}</td><td>${status}</td></tr>`;
      tbodyAdm += `<tr><td class="fw-bold">${item.kode}</td><td>${item.nama}<br><small class="text-muted">${item.merek || '-'}</small></td><td class="fw-bold text-center">${this.formatAngka(item.stok)} <small>${item.satuan}</small></td><td class="text-center text-muted">${this.formatAngka(item.minStok)}</td><td><span class="badge-dept">${item.peruntukan}</span></td><td class="text-center"><button class="btn btn-sm btn-light text-primary me-1" data-kode="${item.kode}" onclick="LogistikController.bukaModalBarang('edit', this.getAttribute('data-kode'))"><i class="fa-solid fa-pen"></i></button><button class="btn btn-sm btn-light text-danger" data-kode="${item.kode}" onclick="LogistikController.konfirmasiHapus('Master_Barang', this.getAttribute('data-kode'))"><i class="fa-solid fa-trash"></i></button></td></tr>`;
      optBarang += `<option value="${item.kode}">${item.kode} - ${item.nama} (Sisa: ${this.formatAngka(item.stok)} ${item.satuan})</option>`;
    });
    document.getElementById('dataBarangPublicBody').innerHTML = tbodyPub || `<tr><td colspan="5" class="text-center text-muted py-5">Belum ada data barang.</td></tr>`;
    document.getElementById('dataBarangAdminBody').innerHTML = tbodyAdm;

    // 2. Supplier
    let tbodySupp = '', optSupp = '<option value="">-- Ketik Vendor --</option>';
    db.supplier.forEach(sup => {
      optSupp += `<option value="${sup.nama}">${sup.nama} [${sup.spesifikasi}]</option>`;
      tbodySupp += `<tr><td class="fw-semibold">${sup.kode}</td><td><b>${sup.nama}</b><br><span class="badge bg-light text-primary mt-1 border"><i class="fa-solid fa-tag me-1"></i>${sup.spesifikasi}</span></td><td>${sup.telp || '-'}</td><td>${sup.alamat || '-'}</td><td class="text-center"><button class="btn btn-sm btn-light text-warning me-1" data-kode="${sup.kode}" onclick="LogistikController.bukaModalSupplier('edit', this.getAttribute('data-kode'))"><i class="fa-solid fa-pen"></i></button><button class="btn btn-sm btn-light text-danger" data-kode="${sup.kode}" onclick="LogistikController.konfirmasiHapus('Supplier', this.getAttribute('data-kode'))"><i class="fa-solid fa-trash"></i></button></td></tr>`;
    });
    document.getElementById('dataSupplierBody').innerHTML = tbodySupp;

    // 3. Departemen
    let tbodyDept = '', optDept = '<option value="">-- Pilih Dept --</option>', optDeptMaster = '<option value="Umum">Umum</option>';
    let optFilterDept = '<option value="">Semua Dept</option><option value="Umum">Umum</option>';
    db.departemen.forEach(dept => {
      optDept += `<option value="${dept.nama}">${dept.nama}</option>`; 
      optDeptMaster += `<option value="${dept.nama}">${dept.nama}</option>`; 
      optFilterDept += `<option value="${dept.nama}">${dept.nama}</option>`;
      tbodyDept += `<tr><td class="fw-semibold">${dept.kode}</td><td class="fw-bold">${dept.nama}</td><td class="text-center"><button class="btn btn-sm btn-light text-info me-1" data-kode="${dept.kode}" onclick="LogistikController.bukaModalDepartemen('edit', this.getAttribute('data-kode'))"><i class="fa-solid fa-pen"></i></button><button class="btn btn-sm btn-light text-danger" data-kode="${dept.kode}" onclick="LogistikController.konfirmasiHapus('Departemen', this.getAttribute('data-kode'))"><i class="fa-solid fa-trash"></i></button></td></tr>`;
    });
    document.getElementById('dataDepartemenBody').innerHTML = tbodyDept;
    document.getElementById('k_dept').innerHTML = optDept; 
    document.getElementById('b_dept').innerHTML = optDeptMaster;
    document.getElementById('filterPubDept').innerHTML = optFilterDept; 
    document.getElementById('filterMasterDept').innerHTML = optFilterDept;

    // 4. Histori
    let tbKeluar = ''; db.keluar.forEach(k => { const itm = db.stok.find(x => x.kode === k.kode); tbKeluar += `<tr><td>${k.tgl}</td><td><span class="badge bg-light text-dark border">${k.id}</span></td><td><b>${itm ? itm.nama : '-'}</b><br><small class="text-muted">${k.kode}</small></td><td class="text-danger fw-bold">-${k.jumlah}</td><td><span class="badge-dept">${k.dept}</span></td><td>${k.ket}</td></tr>`; });
    document.getElementById('dataHistoriKeluarBody').innerHTML = tbKeluar;
    let tbMasuk = ''; db.masuk.forEach(m => { const itm = db.stok.find(x => x.kode === m.kode); tbMasuk += `<tr><td>${m.tgl}</td><td><span class="badge bg-light text-dark border">${m.id}</span></td><td><b>${itm ? itm.nama : '-'}</b><br><small class="text-muted">${m.kode}</small></td><td class="text-success fw-bold">+${m.jumlah}</td><td>${m.supplier}</td><td>${m.ket}</td></tr>`; });
    document.getElementById('dataHistoriMasukBody').innerHTML = tbMasuk;

    // 5. Inisialisasi DataTables
    const dtConf = { pageLength: 10, stateSave: true, language: { search: "Cari:", lengthMenu: "_MENU_ data", info: "_START_ - _END_ dari _TOTAL_", infoEmpty: "0 data", paginate: { previous: "Prev", next: "Next" } } };
    tableIds.forEach(id => { $(id).DataTable(dtConf); });

    $('#filterPubDept').off('change').on('change', function() { $('#tablePublicBarang').DataTable().column(2).search(this.value).draw(); });
    $('#filterPubStatus').off('change').on('change', function() { $('#tablePublicBarang').DataTable().column(4).search(this.value).draw(); });
    $('#filterMasterDept').off('change').on('change', function() { $('#tableMasterBarang').DataTable().column(4).search(this.value).draw(); });

    // 6. Setup TomSelect
    document.getElementById('k_kode').innerHTML = optBarang; 
    document.getElementById('m_kode_masuk').innerHTML = optBarang; 
    document.getElementById('m_supplier').innerHTML = optSupp;
  }

  static alihkanKeAdmin() {
    document.getElementById('publicArea').classList.add('hidden');
    document.getElementById('adminAreaContent').classList.remove('hidden');
    document.getElementById('adminSidebar').classList.remove('hidden');
  }

  static alihkanKePublik() {
    document.getElementById('adminAreaContent').classList.add('hidden');
    document.getElementById('adminSidebar').classList.add('hidden');
    document.getElementById('publicArea').classList.remove('hidden');
  }
}