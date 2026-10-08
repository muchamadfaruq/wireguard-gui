import type { TranslationKey } from './en';

export const id: Partial<Record<TranslationKey, string>> = {
  // Brand / shell
  'app.title': 'WireGuard',
  'app.subtitle': 'Konsol Manajemen',

  // Navigation
  'nav.dashboard': 'Dasbor',
  'nav.peers': 'Peer',
  'nav.guide': 'Panduan',
  'nav.configs': 'Konfigurasi',
  'nav.backup': 'Cadangan',
  'nav.settings': 'Pengaturan',

  // Theme & account
  'theme.dark': 'Mode gelap',
  'theme.light': 'Mode terang',
  'theme.toggle': 'Ubah tema',
  'user.role': 'Administrator',
  'user.logout': 'Keluar',

  // Common
  'common.refresh': 'Segarkan',
  'common.cancel': 'Batal',
  'common.confirm': 'Konfirmasi',
  'common.working': 'Memproses...',
  'common.copy': 'Salin',
  'common.copied': 'Disalin ke papan klip',
  'common.copyFailed': 'Gagal menyalin',
  'common.back': 'Kembali',
  'common.continue': 'Lanjutkan',
  'common.download': 'Unduh',
  'common.remove': 'Hapus',
  'common.delete': 'Hapus',
  'common.qr': 'QR',
  'common.config': 'Konfigurasi',
  'common.enabled': 'Aktif',
  'common.disabled': 'Nonaktif',
  'common.online': 'Daring',
  'common.offline': 'Luring',
  'common.running': 'Berjalan',
  'common.stopped': 'Berhenti',
  'common.never': 'Tidak pernah',
  'common.notSet': 'Belum diatur',
  'common.loading': 'Memuat...',
  'common.udp': 'UDP',
  'common.import': 'Impor .conf',
  'common.language': 'Bahasa',
  'common.languageDesc': 'Pilih bahasa antarmuka.',

  // Time formatting
  'time.secondsAgo': '{n} dtk lalu',
  'time.minutesAgo': '{n} mnt lalu',
  'time.hoursAgo': '{n} jam lalu',
  'time.daysAgo': '{n} hr lalu',

  // QR dialog
  'qr.download': 'Unduh konfigurasi',
  'qr.alt': 'Kode QR WireGuard',

  // Login
  'login.title': 'Konsol WireGuard',
  'login.subtitle': 'Masuk untuk mengelola server VPN Anda',
  'login.username': 'Nama pengguna',
  'login.password': 'Kata sandi',
  'login.submit': 'Masuk',
  'login.failed': 'Gagal masuk',

  // Dashboard
  'dashboard.title': 'Dasbor',
  'dashboard.subtitle': 'Ringkasan dan status server WireGuard Anda',
  'dashboard.mockWarning':
    'Berjalan dalam mode tiruan — tidak ada antarmuka WireGuard sungguhan yang aktif. Terapkan di host Linux dengan modul kernel WireGuard untuk fungsionalitas penuh.',
  'dashboard.endpointWarning':
    'Endpoint publik belum diatur. Atur di Pengaturan agar konfigurasi klien yang dihasilkan memuat alamat yang dapat dijangkau.',
  'dashboard.server': 'Server',
  'dashboard.interface': 'Antarmuka {name}',
  'dashboard.adopted': 'Diadopsi (eksternal)',
  'dashboard.adoptedNotice':
    'Antarmuka ini diadopsi dari konfigurasi host yang ada. Siklus hidupnya (mulai/berhenti) dikelola oleh host — perubahan pada peer diterapkan secara langsung.',
  'dashboard.adoptedWriteOn': 'Perubahan ditulis kembali ke /etc/wireguard.',
  'dashboard.adoptedWriteOff':
    'Aktifkan write-through di Pengaturan untuk menyimpan perubahan ke konfigurasi host.',
  'dashboard.wgUnavailable':
    'WireGuard tidak tersedia: modul kernel tidak ada dan tidak ada fallback userspace yang terpasang. Antarmuka tidak dapat dijalankan di host ini.',
  'dashboard.power': 'Daya antarmuka',
  'dashboard.powerExternal': 'Dikelola oleh host (systemd atau wg-quick)',
  'dashboard.powerUp': 'Tunnel aktif dan menerima peer',
  'dashboard.powerDown': 'Tunnel nonaktif',
  'dashboard.restart': 'Mulai ulang',
  'dashboard.peers': 'Peer',
  'dashboard.onlineTotal': 'daring / total',
  'dashboard.listenPort': 'Port listen',
  'dashboard.endpoint': 'Endpoint',
  'dashboard.addressLabel': 'Alamat {addr}',
  'dashboard.backend': 'Backend',
  'dashboard.backendReal': 'WireGuard',
  'dashboard.backendMock': 'Tiruan',
  'dashboard.wgDetected': 'wg terdeteksi',
  'dashboard.wgNotFound': 'wg tidak ditemukan',
  'dashboard.peerActivity': 'Aktivitas peer',
  'dashboard.peerActivityDesc': 'Statistik handshake dan transfer langsung',
  'dashboard.noPeers': 'Belum ada peer aktif. Tambahkan dari halaman Peer.',
  'dashboard.noEndpoint': 'Tidak ada endpoint',
  'dashboard.handshake': 'handshake {time}',
  'dashboard.toast.started': 'Server dijalankan',
  'dashboard.toast.stopped': 'Server dihentikan',
  'dashboard.toast.stateError': 'Gagal mengubah status server',
  'dashboard.toast.restarted': 'Server dimulai ulang',
  'dashboard.toast.restartError': 'Gagal memulai ulang server',

  // Peers
  'peers.title': 'Peer',
  'peers.subtitle': 'Perangkat yang terhubung ke server WireGuard Anda',
  'peers.add': 'Tambah peer',
  'peers.add.title': 'Tambah peer',
  'peers.add.description': 'Kunci baru dan alamat IP dibuat secara otomatis.',
  'peers.add.name': 'Nama',
  'peers.add.namePlaceholder': 'mis. laptop-faruq',
  'peers.add.extraAllowedIps': 'IP yang diizinkan tambahan (opsional)',
  'peers.add.extraAllowedIpsPlaceholder': '192.168.1.0/24',
  'peers.add.extraAllowedIpsHint':
    'Jaringan tambahan yang dirutekan ke perangkat ini (misalnya LAN di belakangnya). Alamat tunnel yang dihasilkan selalu disertakan, jadi biasanya ini bisa dibiarkan kosong.',
  'peers.add.keepalive': 'Keepalive persisten (opsional)',
  'peers.add.psk': 'Gunakan preshared key',
  'peers.add.pskHint': 'Menambah lapisan keamanan ekstra.',
  'peers.add.create': 'Buat peer',
  'peers.add.cancel': 'Batal',
  'peers.adoptNotice':
    'Mode adopsi: antarmuka dikelola oleh host dari /etc/wireguard. Peer yang diimpor dari host tidak memiliki private key, sehingga QR/Konfigurasi tidak tersedia untuknya. Tambahkan peer di sini, atau gunakan Buat ulang untuk menghasilkan kunci baru.',
  'peers.adoptNoticeWriteOn': 'Perubahan ditulis kembali ke konfigurasi host.',
  'peers.adoptNoticeWriteOff':
    'Aktifkan write-through di Pengaturan untuk menyimpan perubahan ke konfigurasi host.',
  'peers.imported':
    'Diimpor dari antarmuka eksternal — private key tidak tersedia, sehingga tidak ada konfigurasi klien/QR.',
  'peers.importedRekey':
    'Gunakan "Buat ulang" untuk menghasilkan kunci baru (perangkat harus mengimpor ulang).',
  'peers.importedEnableWrite': 'Aktifkan write-through di Pengaturan untuk membuat ulang.',
  'peers.showQr': 'Tampilkan kode QR',
  'peers.privateKeyUnavailable': 'Private key tidak tersedia',
  'peers.copyClientConfig': 'Salin konfigurasi klien',
  'peers.downloadConfig': 'Unduh konfigurasi klien',
  'peers.regenKeys': 'Buat ulang kunci',
  'peers.recreateKeys': 'Buat ulang dengan kunci baru (perangkat harus mengimpor ulang)',
  'peers.deletePeer': 'Hapus peer',
  'peers.enabled': 'Aktif',
  'peers.handshake': 'Handshake {time}',
  'peers.loadFailed': 'Gagal memuat peer.',
  'peers.empty': 'Belum ada peer',
  'peers.emptyHint': 'Tambahkan peer pertama Anda untuk menghasilkan konfigurasi dan kode QR.',
  'peers.qrTitle': '{name} — kode QR',
  'peers.qrDesc': 'Pindai dengan aplikasi seluler WireGuard untuk mengimpor peer ini.',
  'peers.deleteTitle': 'Hapus peer?',
  'peers.deleteDesc': 'Ini akan menghapus "{name}" secara permanen dan mencabut aksesnya.',
  'peers.regenTitle': 'Buat ulang kunci?',
  'peers.recreateTitle': 'Buat ulang dengan kunci baru?',
  'peers.regenDesc':
    'Peer perlu mengimpor konfigurasi baru; konfigurasi lama tidak lagi berfungsi.',
  'peers.recreateDesc':
    'Pasangan kunci baru akan dibuat dan ditulis ke /etc/wireguard. Perangkat yang ada tidak lagi berfungsi hingga mengimpor konfigurasi baru.',
  'peers.regenerate': 'Buat ulang',
  'peers.recreate': 'Buat ulang',
  'peers.toast.created': 'Peer dibuat',
  'peers.toast.createFailed': 'Gagal membuat peer',
  'peers.toast.updateFailed': 'Pembaruan gagal',
  'peers.toast.deleted': 'Peer dihapus',
  'peers.toast.deleteFailed': 'Penghapusan gagal',
  'peers.toast.regen': 'Kunci dibuat ulang',
  'peers.toast.regenFailed': 'Gagal membuat ulang',

  // Client configs
  'clients.title': 'Konfigurasi klien',
  'clients.subtitle':
    'Impor dan simpan konfigurasi WireGuard dari server atau klien lain',
  'clients.importedAt': 'Diimpor {date}',
  'clients.removeTitle': 'Hapus konfigurasi?',
  'clients.removeDesc': '"{name}" akan dihapus dari pustaka.',
  'clients.empty': 'Tidak ada konfigurasi yang diimpor',
  'clients.emptyHint':
    'Unggah file .conf WireGuard untuk menyimpannya di sini agar dapat cepat diunduh atau dibagikan via QR.',
  'clients.toast.removed': 'Konfigurasi dihapus',
  'clients.toast.imported': 'Mengimpor "{name}"',
  'clients.toast.importFailed': 'Impor gagal',
  'clients.toast.deleteFailed': 'Penghapusan gagal',

  // Backup
  'backup.title': 'Cadangkan & Pulihkan',
  'backup.subtitle': 'Ekspor atau impor seluruh data WireGuard GUI Anda',
  'backup.export': 'Ekspor cadangan',
  'backup.exportDesc':
    'Mengunduh arsip ZIP berisi basis data, konfigurasi server, dan konfigurasi klien yang diimpor.',
  'backup.download': 'Unduh cadangan',
  'backup.restore': 'Pulihkan cadangan',
  'backup.restoreDesc':
    'Unggah ZIP yang sebelumnya diekspor. Data Anda saat ini dicadangkan secara otomatis sebelum diganti.',
  'backup.choose': 'Pilih file cadangan',
  'backup.warning':
    'Memulihkan akan mengganti semua peer, pengaturan server, dan konfigurasi yang diimpor saat ini. Antarmuka WireGuard akan dimulai ulang jika sebelumnya aktif.',
  'backup.confirmTitle': 'Pulihkan cadangan ini?',
  'backup.confirmDesc':
    '"{name}" akan menimpa data saat ini. Salinan pengaman data saat ini disimpan di server.',
  'backup.confirmLabel': 'Pulihkan',
  'backup.toast.restored': 'Cadangan dipulihkan — {count} peer',
  'backup.toast.failed': 'Pemulihan gagal',

  // Settings
  'settings.title': 'Pengaturan',
  'settings.subtitle': 'Parameter server dan keamanan akun',
  'settings.server': 'Server',
  'settings.serverDesc': 'Nilai-nilai ini mengontrol bagaimana konfigurasi klien dihasilkan.',
  'settings.endpoint': 'Endpoint publik (host atau IP)',
  'settings.endpointPlaceholder': 'vpn.example.com',
  'settings.endpointHint': 'Klien terhubung ke alamat ini pada port listen di bawah.',
  'settings.dns': 'DNS',
  'settings.clientRouting': 'IP yang diizinkan (perutean klien)',
  'settings.listenPort': 'Port listen',
  'settings.mtu': 'MTU',
  'settings.keepalive': 'Keepalive persisten',
  'settings.subnet': 'Subnet (CIDR)',
  'settings.address': 'Alamat server',
  'settings.adoptReadOnly':
    'Kolom yang dimiliki oleh antarmuka host (port, MTU, subnet, alamat) bersifat hanya-baca dalam mode adopsi.',
  'settings.publicKey': 'Public key server',
  'settings.save': 'Simpan perubahan',
  'settings.toast.saved': 'Pengaturan disimpan',
  'settings.toast.saveFailed': 'Gagal menyimpan pengaturan',
  'settings.language': 'Bahasa',
  'settings.changePassword': 'Ubah kata sandi',
  'settings.changePasswordDesc': 'Perbarui kata sandi akun administrator.',
  'settings.currentPassword': 'Kata sandi saat ini',
  'settings.newPassword': 'Kata sandi baru',
  'settings.confirmPassword': 'Konfirmasi kata sandi',
  'settings.updatePassword': 'Perbarui kata sandi',
  'settings.toast.passwordUpdated': 'Kata sandi diperbarui',
  'settings.toast.passwordFailed': 'Gagal memperbarui kata sandi',
  'settings.passwordTooShort': 'Kata sandi baru minimal 6 karakter',
  'settings.passwordMismatch': 'Konfirmasi kata sandi tidak cocok',
  'settings.hostSync': 'Sinkronisasi konfigurasi host',
  'settings.hostSyncDesc': 'Jaga /etc/wireguard tetap sinkron dengan aplikasi ini (dua arah).',
  'settings.writeThrough': 'Write-through ke konfigurasi host',
  'settings.writeThroughDesc':
    'Simpan perubahan peer ke file host agar tetap bertahan setelah reboot. Perubahan manual pada file juga diimpor secara otomatis.',
  'settings.writeThroughToast': 'Write-through {state}',
  'settings.writeThroughOn': 'diaktifkan',
  'settings.writeThroughOff': 'dinonaktifkan',
  'settings.toast.writeThroughFailed': 'Gagal memperbarui write-through',
  'settings.hostNotWritable':
    'Konfigurasi host tidak dapat ditulis. Pastikan /etc/wireguard dipasang read-write di docker-compose.yml (dan tambahkan :z pada sistem SELinux).',
  'settings.hostWritable': 'Konfigurasi host dapat ditulis',
  'settings.reapply': 'Terapkan ulang sekarang',
  'settings.toast.reapplied': 'Diterapkan ulang ke konfigurasi host dan antarmuka',
  'settings.toast.reapplyFailed': 'Gagal menerapkan ulang',

  // Setup wizard
  'setup.title': 'Selamat datang — mari kita siapkan',
  'setup.subtitle': 'Buat akun administrator dan konfigurasikan server WireGuard.',
  'setup.wgDetected': 'WireGuard terdeteksi',
  'setup.mockMode': 'Mode tiruan',
  'setup.step.account': 'Akun',
  'setup.step.method': 'Metode',
  'setup.step.network': 'Jaringan',
  'setup.wgReady': 'wg siap',
  'setup.wgMissing': 'wg tidak ada',
  'setup.kernel': 'kernel',
  'setup.userspace': 'userspace',
  'setup.unknown': 'tidak diketahui',
  'setup.fallback': 'fallback: {name}',
  'setup.adminUsername': 'Nama pengguna admin',
  'setup.password': 'Kata sandi',
  'setup.passwordHint': 'Minimal 6 karakter.',
  'setup.confirmPassword': 'Konfirmasi kata sandi',
  'setup.token': 'Token setup',
  'setup.methodIntro':
    'Konfigurasi WireGuard yang ada ditemukan di {dir}. Bagaimana Anda ingin melanjutkan?',
  'setup.adopt': 'Adopsi "{name}"',
  'setup.adoptDetail':
    '{address} · port {port} · {count} peer. Host tetap mengelola antarmuka.',
  'setup.noAddress': 'tidak ada alamat',
  'setup.startFresh': 'Mulai dari awal',
  'setup.startFreshDetail':
    'Buat konfigurasi server baru yang dikelola sepenuhnya oleh aplikasi ini. Gunakan nama antarmuka/port yang berbeda untuk menghindari konflik.',
  'setup.adopting': 'Mengadopsi "{name}"',
  'setup.adoptingDetail':
    'Siklus hidup antarmuka tetap ditangani host. Peer yang diimpor dari host tidak memiliki private key, sehingga konfigurasi klien/QR tidak dapat dibuat untuknya.',
  'setup.writeThrough': 'Tulis perubahan ke konfigurasi host',
  'setup.writeThroughDetail': 'Jaga /etc/wireguard tetap sinkron (dua arah). Direkomendasikan.',
  'setup.endpoint': 'Endpoint publik (host atau IP)',
  'setup.endpointPlaceholder': 'vpn.example.com',
  'setup.detect': 'Deteksi',
  'setup.endpointHint':
    'Alamat yang digunakan klien untuk menjangkau server ini. Biarkan kosong untuk mengaturnya nanti.',
  'setup.subnet': 'Subnet (CIDR)',
  'setup.listenPort': 'Port listen',
  'setup.dns': 'DNS',
  'setup.mtu': 'MTU',
  'setup.fullTunnel': 'Tunnel penuh (rutekan semua lalu lintas)',
  'setup.fullTunnelHint': 'Dorong 0.0.0.0/0 ke klien.',
  'setup.startInterface': 'Jalankan antarmuka sekarang',
  'setup.startInterfaceMock': 'Disimulasikan dalam mode tiruan.',
  'setup.startInterfaceHint': 'Langsung aktifkan tunnel WireGuard.',
  'setup.finish': 'Selesaikan setup',
  'setup.toast.detected': 'Endpoint publik terdeteksi: {endpoint}',
  'setup.toast.detectNoIp': 'Tidak dapat mendeteksi IP publik. Masukkan secara manual.',
  'setup.toast.detectFailed': 'Deteksi gagal. Masukkan endpoint secara manual.',
  'setup.toast.complete': 'Setup selesai. Selamat datang!',
  'setup.toast.failed': 'Setup gagal',
  'setup.usernameRequired': 'Nama pengguna wajib diisi',
  'setup.passwordTooShort': 'Kata sandi minimal 6 karakter',
  'setup.passwordMismatch': 'Konfirmasi kata sandi tidak cocok',

  // Guide
  'guide.title': 'Panduan penyiapan klien',
  'guide.subtitle':
    'Cara mengimpor dan mengaktifkan konfigurasi WireGuard di setiap sistem operasi',
  'guide.getConfig.title': 'Dapatkan konfigurasi terlebih dahulu',
  'guide.getConfig.desc':
    'Setiap perangkat memerlukan peer-nya sendiri agar mendapat kunci dan alamat yang unik.',
  'guide.getConfig.qrTitle': 'Seluler (kode QR)',
  'guide.getConfig.qrDesc': 'Di halaman Peer, klik QR dan pindai dengan aplikasi WireGuard.',
  'guide.getConfig.fileTitle': 'Desktop (file .conf)',
  'guide.getConfig.fileDesc':
    'Di halaman Peer, klik Konfigurasi untuk mengunduh file, lalu impor.',
  'guide.getConfig.goToPeers': 'Buka Peer',
  'guide.steps.title': 'Petunjuk langkah demi langkah',
  'guide.steps.desc': 'Pilih sistem operasi Anda.',
  'guide.os.android': 'Android',
  'guide.os.ios': 'iOS / iPadOS',
  'guide.os.windows': 'Windows',
  'guide.os.macos': 'macOS',
  'guide.os.linux': 'Linux',
  'guide.verify.title': 'Verifikasi koneksi',
  'guide.verify.intro':
    'Setelah tunnel aktif, buka Peer dan lihat kartu perangkat:',
  'guide.verify.handshake':
    'Handshake yang baru saja terjadi (beberapa detik lalu) berarti tunnel telah terbentuk.',
  'guide.verify.counters': 'Penghitung turun / naik bertambah saat lalu lintas mengalir.',
  'guide.verify.badge': 'Lencana menampilkan perangkat sebagai daring.',
  'guide.trouble.title': 'Pemecahan masalah',
  'guide.trouble.noHandshakeTitle': 'Tidak ada handshake sama sekali',
  'guide.trouble.noHandshakeBody':
    'Pastikan antarmuka server berjalan (Dasbor), endpoint publik diatur dengan benar (Pengaturan), dan port listen dapat dijangkau melalui UDP dari jaringan klien.',
  'guide.trouble.linuxServiceTitle': 'Linux: layanan gagal dijalankan',
  'guide.trouble.linuxServiceBody':
    'Gunakan nama antarmuka pada unit systemd: wg-quick@wg0, bukan wg-quick@wg0.conf. Periksa error dengan journalctl -xeu wg-quick@wg0.',
  'guide.trouble.tailscaleTitle': 'Tailscale atau VPN lain berhenti berfungsi',
  'guide.trouble.tailscaleBody':
    'Tunnel penuh (AllowedIPs = 0.0.0.0/0) mengambil alih rute default dan dapat mengganggu perutean kebijakan Tailscale. Jika Anda hanya memerlukan jaringan VPN, atur IP yang diizinkan (perutean klien) di Pengaturan ke subnet WireGuard Anda (misalnya 10.8.0.0/24) lalu unduh ulang konfigurasinya.',
  'guide.trouble.desktopQrTitle': 'Klien desktop tidak dapat memindai kode QR',
  'guide.trouble.desktopQrBody':
    'Klien Windows dan macOS mengimpor file .conf. Gunakan Konfigurasi untuk mengunduh file alih-alih kode QR.',

  // Guide steps
  'guide.android.1.title': 'Pasang aplikasi WireGuard',
  'guide.android.1.body': 'Pasang WireGuard dari Google Play atau F-Droid.',
  'guide.android.2.title': 'Tambahkan tunnel',
  'guide.android.2.body':
    'Buka aplikasi dan ketuk +, lalu Pindai dari kode QR. Pindai QR yang ditampilkan di halaman Peer. Jika Anda mengunduh file .conf, pilih Impor dari file atau arsip.',
  'guide.android.3.title': 'Aktifkan',
  'guide.android.3.body':
    'Ketuk tombol di samping tunnel. Android meminta izin koneksi VPN — setujui.',
  'guide.android.4.title': 'Verifikasi',
  'guide.android.4.body':
    'Ikon kunci muncul di bilah status, dan Peer menampilkan handshake dalam beberapa detik.',

  'guide.ios.1.title': 'Pasang aplikasi WireGuard',
  'guide.ios.1.body': 'Pasang WireGuard dari App Store.',
  'guide.ios.2.title': 'Tambahkan tunnel',
  'guide.ios.2.body':
    'Ketuk + dan pilih Buat dari kode QR, lalu pindai QR yang ditampilkan di halaman Peer. Sebagai alternatif, buka file .conf yang diunduh di aplikasi Files lalu pilih untuk membukanya dengan WireGuard.',
  'guide.ios.3.title': 'Aktifkan',
  'guide.ios.3.body': 'Aktifkan tunnel dan setujui permintaan konfigurasi VPN.',
  'guide.ios.4.title': 'Verifikasi',
  'guide.ios.4.body': 'Ikon VPN muncul di bilah status, dan Peer menampilkan handshake.',

  'guide.windows.1.title': 'Pasang klien WireGuard',
  'guide.windows.1.body': 'Unduh dari wireguard.com/install, atau pasang dengan winget:',
  'guide.windows.2.title': 'Impor konfigurasi',
  'guide.windows.2.body':
    'Di halaman Peer, klik Konfigurasi untuk mengunduh file .conf. Di klien WireGuard pilih Add tunnel → Import tunnel(s) from file… dan pilih file tersebut. Klien desktop tidak dapat memindai kode QR.',
  'guide.windows.3.title': 'Aktifkan',
  'guide.windows.3.body': 'Klik Aktifkan.',
  'guide.windows.4.title': 'Verifikasi',
  'guide.windows.4.body':
    'Klien menampilkan Latest handshake yang baru, dan Peer di konsol ini menandai perangkat sebagai daring.',

  'guide.macos.1.title': 'Pasang klien WireGuard',
  'guide.macos.1.body':
    'Pasang WireGuard dari Mac App Store, atau untuk baris perintah gunakan Homebrew:',
  'guide.macos.2.title': 'Impor konfigurasi',
  'guide.macos.2.body':
    'Unduh .conf dari Peer → Konfigurasi. Di aplikasi pilih Import tunnel(s) from file… dan pilih file tersebut.',
  'guide.macos.3.title': 'Aktifkan',
  'guide.macos.3.body': 'Aktifkan tunnel, atau dengan CLI:',
  'guide.macos.4.title': 'Verifikasi',
  'guide.macos.4.body': 'Periksa status aplikasi, atau jalankan:',

  'guide.linux.1.title': 'Pasang wireguard-tools',
  'guide.linux.2.title': 'Tempatkan konfigurasi',
  'guide.linux.2.body':
    'Unduh .conf dari Peer → Konfigurasi, lalu pasang dengan izin hanya-root:',
  'guide.linux.3.title': 'Aktifkan atau nonaktifkan tunnel',
  'guide.linux.4.title': 'Jalankan otomatis saat boot',
  'guide.linux.4.body':
    'Nama unit systemd adalah nama antarmuka tanpa akhiran .conf:',
  'guide.linux.4.hint': 'Benar: wg-quick@wg0 · Salah: wg-quick@wg0.conf',
  'guide.linux.5.title': 'Verifikasi',
  'common.close': 'Tutup',
};
