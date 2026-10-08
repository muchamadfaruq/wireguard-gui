import type { TranslationKey } from './en';

export const de: Partial<Record<TranslationKey, string>> = {
  // Brand / shell
  'app.title': 'WireGuard',
  'app.subtitle': 'Verwaltungskonsole',

  // Navigation
  'nav.dashboard': 'Übersicht',
  'nav.peers': 'Peers',
  'nav.guide': 'Anleitung',
  'nav.configs': 'Konfigurationen',
  'nav.backup': 'Sicherung',
  'nav.settings': 'Einstellungen',

  // Theme & account
  'theme.dark': 'Dunkelmodus',
  'theme.light': 'Hellmodus',
  'theme.toggle': 'Design wechseln',
  'user.role': 'Administrator',
  'user.logout': 'Abmelden',

  // Common
  'common.refresh': 'Aktualisieren',
  'common.cancel': 'Abbrechen',
  'common.confirm': 'Bestätigen',
  'common.working': 'Wird ausgeführt...',
  'common.copy': 'Kopieren',
  'common.copied': 'In die Zwischenablage kopiert',
  'common.copyFailed': 'Kopieren fehlgeschlagen',
  'common.back': 'Zurück',
  'common.continue': 'Weiter',
  'common.download': 'Herunterladen',
  'common.remove': 'Entfernen',
  'common.delete': 'Löschen',
  'common.qr': 'QR',
  'common.config': 'Konfiguration',
  'common.enabled': 'Aktiviert',
  'common.disabled': 'Deaktiviert',
  'common.online': 'Online',
  'common.offline': 'Offline',
  'common.running': 'Läuft',
  'common.stopped': 'Gestoppt',
  'common.never': 'Nie',
  'common.notSet': 'Nicht gesetzt',
  'common.loading': 'Wird geladen...',
  'common.udp': 'UDP',
  'common.import': '.conf importieren',
  'common.language': 'Sprache',
  'common.languageDesc': 'Wählen Sie die Sprache der Oberfläche.',

  // Time formatting
  'time.secondsAgo': 'vor {n}s',
  'time.minutesAgo': 'vor {n}m',
  'time.hoursAgo': 'vor {n}h',
  'time.daysAgo': 'vor {n}T',

  // QR dialog
  'qr.download': 'Konfiguration herunterladen',
  'qr.alt': 'WireGuard QR-Code',

  // Login
  'login.title': 'WireGuard Konsole',
  'login.subtitle': 'Melden Sie sich an, um Ihren VPN-Server zu verwalten',
  'login.username': 'Benutzername',
  'login.password': 'Passwort',
  'login.submit': 'Anmelden',
  'login.failed': 'Anmeldung fehlgeschlagen',

  // Dashboard
  'dashboard.title': 'Übersicht',
  'dashboard.subtitle': 'Überblick und Status Ihres WireGuard-Servers',
  'dashboard.mockWarning':
    'Ausführung im Mock-Modus — keine echte WireGuard-Schnittstelle ist aktiv. Stellen Sie auf einem Linux-Host mit dem WireGuard-Kernelmodul bereit, um den vollen Funktionsumfang zu nutzen.',
  'dashboard.endpointWarning':
    'Öffentlicher Endpunkt ist nicht gesetzt. Konfigurieren Sie ihn in den Einstellungen, damit generierte Client-Konfigurationen eine erreichbare Adresse enthalten.',
  'dashboard.server': 'Server',
  'dashboard.interface': 'Schnittstelle {name}',
  'dashboard.adopted': 'Übernommen (extern)',
  'dashboard.adoptedNotice':
    'Diese Schnittstelle wurde aus einer bestehenden Host-Konfiguration übernommen. Ihr Lebenszyklus (Start/Stop) wird vom Host verwaltet — Änderungen an Peers werden live übernommen.',
  'dashboard.adoptedWriteOn': 'Änderungen werden nach /etc/wireguard zurückgeschrieben.',
  'dashboard.adoptedWriteOff':
    'Aktivieren Sie Write-Through in den Einstellungen, um Änderungen in der Host-Konfiguration zu speichern.',
  'dashboard.wgUnavailable':
    'WireGuard ist nicht verfügbar: Das Kernelmodul fehlt und kein Userspace-Fallback ist installiert. Die Schnittstelle kann auf diesem Host nicht gestartet werden.',
  'dashboard.power': 'Schnittstellenstatus',
  'dashboard.powerExternal': 'Vom Host verwaltet (systemd oder wg-quick)',
  'dashboard.powerUp': 'Tunnel ist aktiv und nimmt Peers an',
  'dashboard.powerDown': 'Tunnel ist inaktiv',
  'dashboard.restart': 'Neu starten',
  'dashboard.peers': 'Peers',
  'dashboard.onlineTotal': 'online / gesamt',
  'dashboard.listenPort': 'Listen-Port',
  'dashboard.endpoint': 'Endpunkt',
  'dashboard.addressLabel': 'Adresse {addr}',
  'dashboard.backend': 'Backend',
  'dashboard.backendReal': 'WireGuard',
  'dashboard.backendMock': 'Mock',
  'dashboard.wgDetected': 'wg erkannt',
  'dashboard.wgNotFound': 'wg nicht gefunden',
  'dashboard.peerActivity': 'Peer-Aktivität',
  'dashboard.peerActivityDesc': 'Live-Handshake- und Übertragungsstatistiken',
  'dashboard.noPeers': 'Noch keine aktiven Peers. Fügen Sie einen auf der Peers-Seite hinzu.',
  'dashboard.noEndpoint': 'Kein Endpunkt',
  'dashboard.handshake': 'Handshake {time}',
  'dashboard.toast.started': 'Server gestartet',
  'dashboard.toast.stopped': 'Server gestoppt',
  'dashboard.toast.stateError': 'Serverstatus konnte nicht geändert werden',
  'dashboard.toast.restarted': 'Server neu gestartet',
  'dashboard.toast.restartError': 'Server konnte nicht neu gestartet werden',

  // Peers
  'peers.title': 'Peers',
  'peers.subtitle': 'Mit Ihrem WireGuard-Server verbundene Geräte',
  'peers.add': 'Peer hinzufügen',
  'peers.add.title': 'Peer hinzufügen',
  'peers.add.description': 'Neue Schlüssel und eine IP-Adresse werden automatisch generiert.',
  'peers.add.name': 'Name',
  'peers.add.namePlaceholder': 'z. B. laptop-faruq',
  'peers.add.extraAllowedIps': 'Zusätzliche erlaubte IPs (optional)',
  'peers.add.extraAllowedIpsPlaceholder': '192.168.1.0/24',
  'peers.add.extraAllowedIpsHint':
    'Zusätzliche Netzwerke, die zu diesem Gerät geroutet werden (zum Beispiel ein dahinterliegendes LAN). Die generierte Tunnel-Adresse ist immer enthalten, daher kann dies normalerweise leer bleiben.',
  'peers.add.keepalive': 'Persistent Keepalive (optional)',
  'peers.add.psk': 'Preshared Key verwenden',
  'peers.add.pskHint': 'Fügt eine zusätzliche Sicherheitsebene hinzu.',
  'peers.add.create': 'Peer erstellen',
  'peers.add.cancel': 'Abbrechen',
  'peers.adoptNotice':
    'Übernahmemodus: Die Schnittstelle wird vom Host aus /etc/wireguard verwaltet. Vom Host importierte Peers haben keinen privaten Schlüssel, daher sind QR/Config für sie nicht verfügbar. Fügen Sie hier einen Peer hinzu oder verwenden Sie Neu erstellen, um neue Schlüssel zu generieren.',
  'peers.adoptNoticeWriteOn': 'Änderungen werden in die Host-Konfiguration zurückgeschrieben.',
  'peers.adoptNoticeWriteOff':
    'Aktivieren Sie Write-Through in den Einstellungen, um Änderungen in der Host-Konfiguration zu speichern.',
  'peers.imported':
    'Aus einer externen Schnittstelle importiert — privater Schlüssel nicht verfügbar, daher keine Client-Konfiguration/QR.',
  'peers.importedRekey':
    'Verwenden Sie „Neu erstellen“, um einen neuen Schlüssel zu generieren (das Gerät muss neu importieren).',
  'peers.importedEnableWrite':
    'Aktivieren Sie Write-Through in den Einstellungen, um ihn neu zu erstellen.',
  'peers.showQr': 'QR-Code anzeigen',
  'peers.privateKeyUnavailable': 'Privater Schlüssel nicht verfügbar',
  'peers.copyClientConfig': 'Client-Konfiguration kopieren',
  'peers.downloadConfig': 'Client-Konfiguration herunterladen',
  'peers.regenKeys': 'Schlüssel neu generieren',
  'peers.recreateKeys': 'Mit neuen Schlüsseln neu erstellen (Gerät muss neu importieren)',
  'peers.deletePeer': 'Peer löschen',
  'peers.enabled': 'Aktiviert',
  'peers.handshake': 'Handshake {time}',
  'peers.loadFailed': 'Peers konnten nicht geladen werden.',
  'peers.empty': 'Noch keine Peers',
  'peers.emptyHint':
    'Fügen Sie Ihren ersten Peer hinzu, um eine Konfiguration und einen QR-Code zu generieren.',
  'peers.qrTitle': '{name} — QR-Code',
  'peers.qrDesc': 'Scannen Sie mit der WireGuard-Mobil-App, um diesen Peer zu importieren.',
  'peers.deleteTitle': 'Peer löschen?',
  'peers.deleteDesc': 'Dies entfernt „{name}“ dauerhaft und entzieht ihm den Zugriff.',
  'peers.regenTitle': 'Schlüssel neu generieren?',
  'peers.recreateTitle': 'Mit neuen Schlüsseln neu erstellen?',
  'peers.regenDesc':
    'Der Peer muss eine neue Konfiguration importieren; die alte funktioniert nicht mehr.',
  'peers.recreateDesc':
    'Ein neues Schlüsselpaar wird generiert und nach /etc/wireguard geschrieben. Das vorhandene Gerät funktioniert nicht mehr, bis es die neue Konfiguration importiert.',
  'peers.regenerate': 'Neu generieren',
  'peers.recreate': 'Neu erstellen',
  'peers.toast.created': 'Peer erstellt',
  'peers.toast.createFailed': 'Peer konnte nicht erstellt werden',
  'peers.toast.updateFailed': 'Aktualisierung fehlgeschlagen',
  'peers.toast.deleted': 'Peer gelöscht',
  'peers.toast.deleteFailed': 'Löschen fehlgeschlagen',
  'peers.toast.regen': 'Schlüssel neu generiert',
  'peers.toast.regenFailed': 'Neu generieren fehlgeschlagen',

  // Client configs
  'clients.title': 'Client-Konfigurationen',
  'clients.subtitle':
    'Importieren und speichern Sie WireGuard-Konfigurationen von anderen Servern oder Clients',
  'clients.importedAt': 'Importiert {date}',
  'clients.removeTitle': 'Konfiguration entfernen?',
  'clients.removeDesc': '„{name}“ wird aus der Bibliothek gelöscht.',
  'clients.empty': 'Keine importierten Konfigurationen',
  'clients.emptyHint':
    'Laden Sie eine WireGuard-.conf-Datei hoch, um sie hier zum schnellen Herunterladen oder Teilen per QR zu speichern.',
  'clients.toast.removed': 'Konfiguration entfernt',
  'clients.toast.imported': '„{name}“ importiert',
  'clients.toast.importFailed': 'Import fehlgeschlagen',
  'clients.toast.deleteFailed': 'Löschen fehlgeschlagen',

  // Backup
  'backup.title': 'Sichern & Wiederherstellen',
  'backup.subtitle': 'Exportieren oder importieren Sie alle Daten Ihrer WireGuard GUI',
  'backup.export': 'Sicherung exportieren',
  'backup.exportDesc':
    'Lädt ein ZIP-Archiv mit der Datenbank, der Server-Konfiguration und importierten Client-Konfigurationen herunter.',
  'backup.download': 'Sicherung herunterladen',
  'backup.restore': 'Sicherung wiederherstellen',
  'backup.restoreDesc':
    'Laden Sie ein zuvor exportiertes ZIP hoch. Ihre aktuellen Daten werden vor dem Ersetzen automatisch gesichert.',
  'backup.choose': 'Sicherungsdatei auswählen',
  'backup.warning':
    'Das Wiederherstellen ersetzt alle aktuellen Peers, Servereinstellungen und importierten Konfigurationen. Die WireGuard-Schnittstelle wird neu gestartet, wenn sie aktiviert war.',
  'backup.confirmTitle': 'Diese Sicherung wiederherstellen?',
  'backup.confirmDesc':
    '„{name}“ überschreibt die aktuellen Daten. Auf dem Server wird eine Sicherheitskopie der aktuellen Daten aufbewahrt.',
  'backup.confirmLabel': 'Wiederherstellen',
  'backup.toast.restored': 'Sicherung wiederhergestellt — {count} Peer(s)',
  'backup.toast.failed': 'Wiederherstellung fehlgeschlagen',

  // Settings
  'settings.title': 'Einstellungen',
  'settings.subtitle': 'Serverparameter und Kontosicherheit',
  'settings.server': 'Server',
  'settings.serverDesc': 'Diese Werte steuern, wie Client-Konfigurationen generiert werden.',
  'settings.endpoint': 'Öffentlicher Endpunkt (Host oder IP)',
  'settings.endpointPlaceholder': 'vpn.example.com',
  'settings.endpointHint': 'Clients verbinden sich über diese Adresse mit dem unten stehenden Listen-Port.',
  'settings.dns': 'DNS',
  'settings.clientRouting': 'Erlaubte IPs (Client-Routing)',
  'settings.listenPort': 'Listen-Port',
  'settings.mtu': 'MTU',
  'settings.keepalive': 'Persistent Keepalive',
  'settings.subnet': 'Subnetz (CIDR)',
  'settings.address': 'Serveradresse',
  'settings.adoptReadOnly':
    'Von der Host-Schnittstelle verwaltete Felder (Port, MTU, Subnetz, Adresse) sind im Übernahmemodus schreibgeschützt.',
  'settings.publicKey': 'Öffentlicher Serverschlüssel',
  'settings.save': 'Änderungen speichern',
  'settings.toast.saved': 'Einstellungen gespeichert',
  'settings.toast.saveFailed': 'Einstellungen konnten nicht gespeichert werden',
  'settings.language': 'Sprache',
  'settings.changePassword': 'Passwort ändern',
  'settings.changePasswordDesc': 'Passwort des Administratorkontos aktualisieren.',
  'settings.currentPassword': 'Aktuelles Passwort',
  'settings.newPassword': 'Neues Passwort',
  'settings.confirmPassword': 'Passwort bestätigen',
  'settings.updatePassword': 'Passwort aktualisieren',
  'settings.toast.passwordUpdated': 'Passwort aktualisiert',
  'settings.toast.passwordFailed': 'Passwort konnte nicht aktualisiert werden',
  'settings.passwordTooShort': 'Das neue Passwort muss mindestens 6 Zeichen lang sein',
  'settings.passwordMismatch': 'Passwortbestätigung stimmt nicht überein',
  'settings.hostSync': 'Host-Konfigurationssynchronisierung',
  'settings.hostSyncDesc': '/etc/wireguard mit dieser App synchron halten (beidseitig).',
  'settings.writeThrough': 'Write-Through in Host-Konfiguration',
  'settings.writeThroughDesc':
    'Peer-Änderungen in der Host-Datei speichern, damit sie Neustarts überstehen. Manuelle Änderungen an der Datei werden ebenfalls automatisch importiert.',
  'settings.writeThroughToast': 'Write-Through {state}',
  'settings.writeThroughOn': 'aktiviert',
  'settings.writeThroughOff': 'deaktiviert',
  'settings.toast.writeThroughFailed': 'Write-Through konnte nicht aktualisiert werden',
  'settings.hostNotWritable':
    'Die Host-Konfiguration ist nicht beschreibbar. Stellen Sie sicher, dass /etc/wireguard in docker-compose.yml mit Lese-/Schreibzugriff eingebunden ist (und fügen Sie :z auf SELinux-Systemen hinzu).',
  'settings.hostWritable': 'Host-Konfiguration ist beschreibbar',
  'settings.reapply': 'Jetzt erneut anwenden',
  'settings.toast.reapplied': 'Erneut auf Host-Konfiguration und Schnittstelle angewendet',
  'settings.toast.reapplyFailed': 'Erneutes Anwenden fehlgeschlagen',

  // Setup wizard
  'setup.title': 'Willkommen — richten wir alles ein',
  'setup.subtitle':
    'Erstellen Sie Ihr Administratorkonto und konfigurieren Sie den WireGuard-Server.',
  'setup.wgDetected': 'WireGuard erkannt',
  'setup.mockMode': 'Mock-Modus',
  'setup.step.account': 'Konto',
  'setup.step.method': 'Methode',
  'setup.step.network': 'Netzwerk',
  'setup.wgReady': 'wg bereit',
  'setup.wgMissing': 'wg fehlt',
  'setup.kernel': 'Kernel',
  'setup.userspace': 'Userspace',
  'setup.unknown': 'unbekannt',
  'setup.fallback': 'Fallback: {name}',
  'setup.adminUsername': 'Admin-Benutzername',
  'setup.password': 'Passwort',
  'setup.passwordHint': 'Mindestens 6 Zeichen.',
  'setup.confirmPassword': 'Passwort bestätigen',
  'setup.token': 'Setup-Token',
  'setup.methodIntro':
    'In {dir} wurde eine bestehende WireGuard-Konfiguration gefunden. Wie möchten Sie fortfahren?',
  'setup.adopt': '„{name}“ übernehmen',
  'setup.adoptDetail':
    '{address} · Port {port} · {count} Peer(s). Der Host verwaltet die Schnittstelle weiterhin.',
  'setup.noAddress': 'keine Adresse',
  'setup.startFresh': 'Neu beginnen',
  'setup.startFreshDetail':
    'Erstellen Sie eine neue Server-Konfiguration, die vollständig von dieser App verwaltet wird. Verwenden Sie einen anderen Schnittstellennamen/-Port, um Konflikte zu vermeiden.',
  'setup.adopting': '„{name}“ wird übernommen',
  'setup.adoptingDetail':
    'Der Lebenszyklus der Schnittstelle bleibt beim Host. Vom Host importierte Peers haben keinen privaten Schlüssel, daher können für sie keine Client-Konfigurationen/QR generiert werden.',
  'setup.writeThrough': 'Änderungen in Host-Konfiguration schreiben',
  'setup.writeThroughDetail': '/etc/wireguard synchron halten (beidseitig). Empfohlen.',
  'setup.endpoint': 'Öffentlicher Endpunkt (Host oder IP)',
  'setup.endpointPlaceholder': 'vpn.example.com',
  'setup.detect': 'Erkennen',
  'setup.endpointHint':
    'Adresse, die Clients verwenden, um diesen Server zu erreichen. Leer lassen, um sie später festzulegen.',
  'setup.subnet': 'Subnetz (CIDR)',
  'setup.listenPort': 'Listen-Port',
  'setup.dns': 'DNS',
  'setup.mtu': 'MTU',
  'setup.fullTunnel': 'Vollständiger Tunnel (gesamten Datenverkehr routen)',
  'setup.fullTunnelHint': '0.0.0.0/0 an Clients übermitteln.',
  'setup.startInterface': 'Schnittstelle jetzt starten',
  'setup.startInterfaceMock': 'Im Mock-Modus simuliert.',
  'setup.startInterfaceHint': 'Den WireGuard-Tunnel sofort aktivieren.',
  'setup.finish': 'Einrichtung abschließen',
  'setup.toast.detected': 'Öffentlicher Endpunkt erkannt: {endpoint}',
  'setup.toast.detectNoIp': 'Keine öffentliche IP erkannt. Geben Sie sie manuell ein.',
  'setup.toast.detectFailed': 'Erkennung fehlgeschlagen. Geben Sie den Endpunkt manuell ein.',
  'setup.toast.complete': 'Einrichtung abgeschlossen. Willkommen!',
  'setup.toast.failed': 'Einrichtung fehlgeschlagen',
  'setup.usernameRequired': 'Benutzername ist erforderlich',
  'setup.passwordTooShort': 'Das Passwort muss mindestens 6 Zeichen lang sein',
  'setup.passwordMismatch': 'Passwortbestätigung stimmt nicht überein',

  // Guide
  'guide.title': 'Client-Einrichtungsanleitung',
  'guide.subtitle':
    'So importieren und aktivieren Sie eine WireGuard-Konfiguration unter jedem Betriebssystem',
  'guide.getConfig.title': 'Zuerst eine Konfiguration beziehen',
  'guide.getConfig.desc':
    'Jedes Gerät benötigt einen eigenen Peer, damit es eindeutige Schlüssel und eine Adresse erhält.',
  'guide.getConfig.qrTitle': 'Mobil (QR-Code)',
  'guide.getConfig.qrDesc': 'Klicken Sie unter Peers auf QR und scannen Sie ihn mit der WireGuard-App.',
  'guide.getConfig.fileTitle': 'Desktop (.conf-Datei)',
  'guide.getConfig.fileDesc':
    'Klicken Sie unter Peers auf Konfiguration, um die Datei herunterzuladen, und importieren Sie sie dann.',
  'guide.getConfig.goToPeers': 'Zu Peers',
  'guide.steps.title': 'Schritt-für-Schritt-Anleitung',
  'guide.steps.desc': 'Wählen Sie Ihr Betriebssystem.',
  'guide.os.android': 'Android',
  'guide.os.ios': 'iOS / iPadOS',
  'guide.os.windows': 'Windows',
  'guide.os.macos': 'macOS',
  'guide.os.linux': 'Linux',
  'guide.verify.title': 'Verbindung überprüfen',
  'guide.verify.intro':
    'Sobald der Tunnel aktiv ist, öffnen Sie Peers und sehen Sie sich die Gerätekarte an:',
  'guide.verify.handshake':
    'Ein aktueller Handshake (vor wenigen Sekunden) bedeutet, dass der Tunnel hergestellt ist.',
  'guide.verify.counters': 'Die Down-/Up-Zähler steigen, wenn Datenverkehr fließt.',
  'guide.verify.badge': 'Die Markierung zeigt das Gerät als online an.',
  'guide.trouble.title': 'Fehlerbehebung',
  'guide.trouble.noHandshakeTitle': 'Überhaupt kein Handshake',
  'guide.trouble.noHandshakeBody':
    'Stellen Sie sicher, dass die Server-Schnittstelle läuft (Übersicht), der öffentliche Endpunkt korrekt gesetzt ist (Einstellungen) und der Listen-Port vom Client-Netzwerk aus über UDP erreichbar ist.',
  'guide.trouble.linuxServiceTitle': 'Linux: Der Dienst startet nicht',
  'guide.trouble.linuxServiceBody':
    'Verwenden Sie den Schnittstellennamen in der systemd-Unit: wg-quick@wg0, nicht wg-quick@wg0.conf. Prüfen Sie Fehler mit journalctl -xeu wg-quick@wg0.',
  'guide.trouble.tailscaleTitle': 'Tailscale oder ein anderes VPN funktioniert nicht mehr',
  'guide.trouble.tailscaleBody':
    'Ein vollständiger Tunnel (AllowedIPs = 0.0.0.0/0) übernimmt die Standardroute und kann das Policy-Routing von Tailscale beeinträchtigen. Wenn Sie nur das VPN-Netzwerk benötigen, setzen Sie Erlaubte IPs (Client-Routing) in den Einstellungen auf Ihr WireGuard-Subnetz (zum Beispiel 10.8.0.0/24) und laden Sie die Konfiguration erneut herunter.',
  'guide.trouble.desktopQrTitle': 'Desktop-Client kann den QR-Code nicht scannen',
  'guide.trouble.desktopQrBody':
    'Die Windows- und macOS-Clients importieren .conf-Dateien. Verwenden Sie Konfiguration, um die Datei statt des QR-Codes herunterzuladen.',

  // Guide steps
  'guide.android.1.title': 'WireGuard-App installieren',
  'guide.android.1.body': 'Installieren Sie WireGuard aus Google Play oder F-Droid.',
  'guide.android.2.title': 'Tunnel hinzufügen',
  'guide.android.2.body':
    'Öffnen Sie die App, tippen Sie auf + und dann auf Aus QR-Code scannen. Scannen Sie den QR-Code, der auf der Peers-Seite angezeigt wird. Wenn Sie stattdessen die .conf-Datei heruntergeladen haben, wählen Sie Aus Datei oder Archiv importieren.',
  'guide.android.3.title': 'Aktivieren',
  'guide.android.3.body':
    'Tippen Sie auf den Schalter neben dem Tunnel. Android fragt nach der Erlaubnis für eine VPN-Verbindung — bestätigen Sie sie.',
  'guide.android.4.title': 'Überprüfen',
  'guide.android.4.body':
    'Ein Schlüsselsymbol erscheint in der Statusleiste und Peers zeigt innerhalb weniger Sekunden einen Handshake an.',

  'guide.ios.1.title': 'WireGuard-App installieren',
  'guide.ios.1.body': 'Installieren Sie WireGuard aus dem App Store.',
  'guide.ios.2.title': 'Tunnel hinzufügen',
  'guide.ios.2.body':
    'Tippen Sie auf + und wählen Sie Aus QR-Code erstellen, dann scannen Sie den QR-Code, der auf der Peers-Seite angezeigt wird. Alternativ können Sie die heruntergeladene .conf-Datei in der Dateien-App öffnen und mit WireGuard öffnen.',
  'guide.ios.3.title': 'Aktivieren',
  'guide.ios.3.body':
    'Schalten Sie den Tunnel ein und bestätigen Sie die VPN-Konfigurationsabfrage.',
  'guide.ios.4.title': 'Überprüfen',
  'guide.ios.4.body':
    'Das VPN-Symbol erscheint in der Statusleiste und Peers zeigt einen Handshake an.',

  'guide.windows.1.title': 'WireGuard-Client installieren',
  'guide.windows.1.body':
    'Laden Sie ihn von wireguard.com/install herunter oder installieren Sie ihn mit winget:',
  'guide.windows.2.title': 'Konfiguration importieren',
  'guide.windows.2.body':
    'Klicken Sie unter Peers auf Konfiguration, um die .conf-Datei herunterzuladen. Wählen Sie im WireGuard-Client Tunnel hinzufügen → Tunnel aus Datei(en) importieren… und wählen Sie sie aus. Der Desktop-Client kann keinen QR-Code scannen.',
  'guide.windows.3.title': 'Aktivieren',
  'guide.windows.3.body': 'Klicken Sie auf Aktivieren.',
  'guide.windows.4.title': 'Überprüfen',
  'guide.windows.4.body':
    'Der Client zeigt einen aktuellen neuesten Handshake an und Peers in dieser Konsole markiert das Gerät als online.',

  'guide.macos.1.title': 'WireGuard-Client installieren',
  'guide.macos.1.body':
    'Installieren Sie WireGuard aus dem Mac App Store oder verwenden Sie für die Kommandozeile Homebrew:',
  'guide.macos.2.title': 'Konfiguration importieren',
  'guide.macos.2.body':
    'Laden Sie die .conf-Datei unter Peers → Konfiguration herunter. Wählen Sie in der App Tunnel aus Datei(en) importieren… und wählen Sie sie aus.',
  'guide.macos.3.title': 'Aktivieren',
  'guide.macos.3.body': 'Schalten Sie den Tunnel ein oder verwenden Sie die CLI:',
  'guide.macos.4.title': 'Überprüfen',
  'guide.macos.4.body': 'Prüfen Sie den App-Status oder führen Sie aus:',

  'guide.linux.1.title': 'wireguard-tools installieren',
  'guide.linux.2.title': 'Konfiguration ablegen',
  'guide.linux.2.body':
    'Laden Sie die .conf-Datei unter Peers → Konfiguration herunter und installieren Sie sie dann mit ausschließlich für Root zugänglichen Berechtigungen:',
  'guide.linux.3.title': 'Tunnel aktivieren oder deaktivieren',
  'guide.linux.4.title': 'Beim Start automatisch starten',
  'guide.linux.4.body':
    'Der Name der systemd-Unit ist der Schnittstellenname ohne das Suffix .conf:',
  'guide.linux.4.hint': 'Richtig: wg-quick@wg0 · Falsch: wg-quick@wg0.conf',
  'guide.linux.5.title': 'Überprüfen',
  'common.close': 'Schließen',
};
