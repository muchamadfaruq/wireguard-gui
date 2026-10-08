import type { TranslationKey } from './en';

export const es: Partial<Record<TranslationKey, string>> = {
  // Brand / shell
  'app.title': 'WireGuard',
  'app.subtitle': 'Consola de gestión',

  // Navigation
  'nav.dashboard': 'Panel',
  'nav.peers': 'Pares',
  'nav.guide': 'Guía',
  'nav.configs': 'Configuraciones',
  'nav.backup': 'Copia de seguridad',
  'nav.settings': 'Ajustes',

  // Theme & account
  'theme.dark': 'Modo oscuro',
  'theme.light': 'Modo claro',
  'theme.toggle': 'Cambiar tema',
  'user.role': 'Administrador',
  'user.logout': 'Cerrar sesión',

  // Common
  'common.refresh': 'Actualizar',
  'common.cancel': 'Cancelar',
  'common.confirm': 'Confirmar',
  'common.working': 'Procesando...',
  'common.copy': 'Copiar',
  'common.copied': 'Copiado al portapapeles',
  'common.copyFailed': 'No se pudo copiar',
  'common.back': 'Atrás',
  'common.continue': 'Continuar',
  'common.download': 'Descargar',
  'common.remove': 'Quitar',
  'common.delete': 'Eliminar',
  'common.qr': 'QR',
  'common.config': 'Config',
  'common.enabled': 'Activado',
  'common.disabled': 'Desactivado',
  'common.online': 'En línea',
  'common.offline': 'Sin conexión',
  'common.running': 'En ejecución',
  'common.stopped': 'Detenido',
  'common.never': 'Nunca',
  'common.notSet': 'Sin configurar',
  'common.loading': 'Cargando...',
  'common.udp': 'UDP',
  'common.import': 'Importar .conf',
  'common.language': 'Idioma',
  'common.languageDesc': 'Elige el idioma de la interfaz.',

  // Time formatting
  'time.secondsAgo': 'hace {n} s',
  'time.minutesAgo': 'hace {n} min',
  'time.hoursAgo': 'hace {n} h',
  'time.daysAgo': 'hace {n} d',

  // QR dialog
  'qr.download': 'Descargar configuración',
  'qr.alt': 'Código QR de WireGuard',

  // Login
  'login.title': 'Consola de WireGuard',
  'login.subtitle': 'Inicia sesión para administrar tu servidor VPN',
  'login.username': 'Usuario',
  'login.password': 'Contraseña',
  'login.submit': 'Iniciar sesión',
  'login.failed': 'Error al iniciar sesión',

  // Dashboard
  'dashboard.title': 'Panel',
  'dashboard.subtitle': 'Resumen y estado de tu servidor WireGuard',
  'dashboard.mockWarning':
    'Ejecutándose en modo simulado: no hay ninguna interfaz WireGuard real activa. Despliega en un host Linux con el módulo del kernel de WireGuard para obtener toda la funcionalidad.',
  'dashboard.endpointWarning':
    'El endpoint público no está configurado. Configúralo en Ajustes para que las configuraciones de cliente generadas contengan una dirección accesible.',
  'dashboard.server': 'Servidor',
  'dashboard.interface': 'Interfaz {name}',
  'dashboard.adopted': 'Adoptada (externa)',
  'dashboard.adoptedNotice':
    'Esta interfaz se adoptó de una configuración existente del host. Su ciclo de vida (iniciar/detener) lo gestiona el host; los cambios en los pares se aplican en vivo.',
  'dashboard.adoptedWriteOn': 'Los cambios se escriben en /etc/wireguard.',
  'dashboard.adoptedWriteOff':
    'Activa la escritura en Ajustes para guardar los cambios en la configuración del host.',
  'dashboard.wgUnavailable':
    'WireGuard no está disponible: falta el módulo del kernel y no hay instalada ninguna alternativa en espacio de usuario. La interfaz no se puede iniciar en este host.',
  'dashboard.power': 'Encendido de la interfaz',
  'dashboard.powerExternal': 'Gestionado por el host (systemd o wg-quick)',
  'dashboard.powerUp': 'El túnel está activo y acepta pares',
  'dashboard.powerDown': 'El túnel está caído',
  'dashboard.restart': 'Reiniciar',
  'dashboard.peers': 'Pares',
  'dashboard.onlineTotal': 'en línea / total',
  'dashboard.listenPort': 'Puerto de escucha',
  'dashboard.endpoint': 'Endpoint',
  'dashboard.addressLabel': 'Dirección {addr}',
  'dashboard.backend': 'Backend',
  'dashboard.backendReal': 'WireGuard',
  'dashboard.backendMock': 'Simulado',
  'dashboard.wgDetected': 'wg detectado',
  'dashboard.wgNotFound': 'wg no encontrado',
  'dashboard.peerActivity': 'Actividad de pares',
  'dashboard.peerActivityDesc': 'Estadísticas de handshake y transferencia en vivo',
  'dashboard.noPeers': 'Aún no hay pares activos. Añade uno desde la página Pares.',
  'dashboard.noEndpoint': 'Sin endpoint',
  'dashboard.handshake': 'handshake {time}',
  'dashboard.toast.started': 'Servidor iniciado',
  'dashboard.toast.stopped': 'Servidor detenido',
  'dashboard.toast.stateError': 'No se pudo cambiar el estado del servidor',
  'dashboard.toast.restarted': 'Servidor reiniciado',
  'dashboard.toast.restartError': 'No se pudo reiniciar el servidor',

  // Peers
  'peers.title': 'Pares',
  'peers.subtitle': 'Dispositivos conectados a tu servidor WireGuard',
  'peers.add': 'Añadir par',
  'peers.add.title': 'Añadir par',
  'peers.add.description': 'Las claves nuevas y una dirección IP se generan automáticamente.',
  'peers.add.name': 'Nombre',
  'peers.add.namePlaceholder': 'p. ej. portatil-faruq',
  'peers.add.extraAllowedIps': 'IPs permitidas adicionales (opcional)',
  'peers.add.extraAllowedIpsPlaceholder': '192.168.1.0/24',
  'peers.add.extraAllowedIpsHint':
    'Redes adicionales enrutadas a este dispositivo (por ejemplo, una LAN detrás de él). La dirección de túnel generada siempre se incluye, así que normalmente puede dejarse vacío.',
  'peers.add.keepalive': 'Keepalive persistente (opcional)',
  'peers.add.psk': 'Usar clave precompartida',
  'peers.add.pskHint': 'Añade una capa extra de seguridad.',
  'peers.add.create': 'Crear par',
  'peers.add.cancel': 'Cancelar',
  'peers.adoptNotice':
    'Modo adopción: el host gestiona la interfaz desde /etc/wireguard. Los pares importados del host no tienen clave privada, así que QR/Config no están disponibles para ellos. Añade un par aquí o usa Recrear para generar claves nuevas.',
  'peers.adoptNoticeWriteOn': 'Los cambios se escriben en la configuración del host.',
  'peers.adoptNoticeWriteOff':
    'Activa la escritura en Ajustes para guardar los cambios en la configuración del host.',
  'peers.imported':
    'Importado de una interfaz externa; la clave privada no está disponible, así que no hay configuración de cliente ni QR.',
  'peers.importedRekey':
    'Usa "Recrear" para generar una clave nueva (el dispositivo debe volver a importarla).',
  'peers.importedEnableWrite': 'Activa la escritura en Ajustes para recrearlo.',
  'peers.showQr': 'Mostrar código QR',
  'peers.privateKeyUnavailable': 'Clave privada no disponible',
  'peers.copyClientConfig': 'Copiar configuración de cliente',
  'peers.downloadConfig': 'Descargar configuración de cliente',
  'peers.regenKeys': 'Regenerar claves',
  'peers.recreateKeys': 'Recrear con claves nuevas (el dispositivo debe reimportar)',
  'peers.deletePeer': 'Eliminar par',
  'peers.enabled': 'Activado',
  'peers.handshake': 'Handshake {time}',
  'peers.loadFailed': 'No se pudieron cargar los pares.',
  'peers.empty': 'Aún no hay pares',
  'peers.emptyHint': 'Añade tu primer par para generar una configuración y un código QR.',
  'peers.qrTitle': '{name} — Código QR',
  'peers.qrDesc': 'Escanea con la app móvil de WireGuard para importar este par.',
  'peers.deleteTitle': '¿Eliminar par?',
  'peers.deleteDesc': 'Esto elimina "{name}" de forma permanente y revoca su acceso.',
  'peers.regenTitle': '¿Regenerar claves?',
  'peers.recreateTitle': '¿Recrear con claves nuevas?',
  'peers.regenDesc':
    'El par tendrá que importar una configuración nueva; la anterior dejará de funcionar.',
  'peers.recreateDesc':
    'Se generará un par de claves nuevo y se escribirá en /etc/wireguard. El dispositivo actual dejará de funcionar hasta que importe la configuración nueva.',
  'peers.regenerate': 'Regenerar',
  'peers.recreate': 'Recrear',
  'peers.toast.created': 'Par creado',
  'peers.toast.createFailed': 'No se pudo crear el par',
  'peers.toast.updateFailed': 'Error al actualizar',
  'peers.toast.deleted': 'Par eliminado',
  'peers.toast.deleteFailed': 'Error al eliminar',
  'peers.toast.regen': 'Claves regeneradas',
  'peers.toast.regenFailed': 'Error al regenerar',

  // Client configs
  'clients.title': 'Configuraciones de cliente',
  'clients.subtitle':
    'Importa y guarda configuraciones de WireGuard de otros servidores o clientes',
  'clients.importedAt': 'Importado {date}',
  'clients.removeTitle': '¿Quitar configuración?',
  'clients.removeDesc': '"{name}" se eliminará de la biblioteca.',
  'clients.empty': 'No hay configuraciones importadas',
  'clients.emptyHint':
    'Sube un archivo .conf de WireGuard para guardarlo aquí y poder descargarlo o compartirlo por QR rápidamente.',
  'clients.toast.removed': 'Configuración quitada',
  'clients.toast.imported': 'Se importó "{name}"',
  'clients.toast.importFailed': 'Error al importar',
  'clients.toast.deleteFailed': 'Error al eliminar',

  // Backup
  'backup.title': 'Copia de seguridad y restauración',
  'backup.subtitle': 'Exporta o importa todos los datos de WireGuard GUI',
  'backup.export': 'Exportar copia',
  'backup.exportDesc':
    'Descarga un archivo ZIP con la base de datos, la configuración del servidor y las configuraciones de cliente importadas.',
  'backup.download': 'Descargar copia',
  'backup.restore': 'Restaurar copia',
  'backup.restoreDesc':
    'Sube un ZIP exportado previamente. Tus datos actuales se respaldan automáticamente antes de reemplazarlos.',
  'backup.choose': 'Elegir archivo de copia',
  'backup.warning':
    'Restaurar reemplaza todos los pares, ajustes del servidor y configuraciones importadas actuales. La interfaz WireGuard se reiniciará si estaba activada.',
  'backup.confirmTitle': '¿Restaurar esta copia?',
  'backup.confirmDesc':
    '"{name}" sobrescribirá los datos actuales. Se guarda una copia de seguridad de los datos actuales en el servidor.',
  'backup.confirmLabel': 'Restaurar',
  'backup.toast.restored': 'Copia restaurada — {count} par(es)',
  'backup.toast.failed': 'Error al restaurar',

  // Settings
  'settings.title': 'Ajustes',
  'settings.subtitle': 'Parámetros del servidor y seguridad de la cuenta',
  'settings.server': 'Servidor',
  'settings.serverDesc':
    'Estos valores controlan cómo se generan las configuraciones de cliente.',
  'settings.endpoint': 'Endpoint público (host o IP)',
  'settings.endpointPlaceholder': 'vpn.example.com',
  'settings.endpointHint':
    'Los clientes se conectan a esta dirección en el puerto de escucha de abajo.',
  'settings.dns': 'DNS',
  'settings.clientRouting': 'IPs permitidas (enrutado del cliente)',
  'settings.listenPort': 'Puerto de escucha',
  'settings.mtu': 'MTU',
  'settings.keepalive': 'Keepalive persistente',
  'settings.subnet': 'Subred (CIDR)',
  'settings.address': 'Dirección del servidor',
  'settings.adoptReadOnly':
    'Los campos propios de la interfaz del host (puerto, MTU, subred, dirección) son de solo lectura en modo adopción.',
  'settings.publicKey': 'Clave pública del servidor',
  'settings.save': 'Guardar cambios',
  'settings.toast.saved': 'Ajustes guardados',
  'settings.toast.saveFailed': 'No se pudieron guardar los ajustes',
  'settings.language': 'Idioma',
  'settings.changePassword': 'Cambiar contraseña',
  'settings.changePasswordDesc': 'Actualiza la contraseña de la cuenta de administrador.',
  'settings.currentPassword': 'Contraseña actual',
  'settings.newPassword': 'Nueva contraseña',
  'settings.confirmPassword': 'Confirmar contraseña',
  'settings.updatePassword': 'Actualizar contraseña',
  'settings.toast.passwordUpdated': 'Contraseña actualizada',
  'settings.toast.passwordFailed': 'No se pudo actualizar la contraseña',
  'settings.passwordTooShort': 'La nueva contraseña debe tener al menos 6 caracteres',
  'settings.passwordMismatch': 'La confirmación de contraseña no coincide',
  'settings.hostSync': 'Sincronización con la configuración del host',
  'settings.hostSyncDesc': 'Mantén /etc/wireguard sincronizado con esta app (bidireccional).',
  'settings.writeThrough': 'Escritura en la configuración del host',
  'settings.writeThroughDesc':
    'Guarda los cambios de los pares en el archivo del host para que sobrevivan a los reinicios. Las ediciones manuales del archivo también se importan automáticamente.',
  'settings.writeThroughToast': 'Escritura {state}',
  'settings.writeThroughOn': 'activada',
  'settings.writeThroughOff': 'desactivada',
  'settings.toast.writeThroughFailed': 'No se pudo actualizar la escritura',
  'settings.hostNotWritable':
    'La configuración del host no es escribible. Asegúrate de que /etc/wireguard está montado como lectura-escritura en docker-compose.yml (y añade :z en sistemas con SELinux).',
  'settings.hostWritable': 'La configuración del host es escribible',
  'settings.reapply': 'Volver a aplicar ahora',
  'settings.toast.reapplied': 'Reaplicado a la configuración del host y a la interfaz',
  'settings.toast.reapplyFailed': 'No se pudo reaplicar',

  // Setup wizard
  'setup.title': 'Bienvenido: vamos a configurarlo',
  'setup.subtitle':
    'Crea tu cuenta de administrador y configura el servidor WireGuard.',
  'setup.wgDetected': 'WireGuard detectado',
  'setup.mockMode': 'Modo simulado',
  'setup.step.account': 'Cuenta',
  'setup.step.method': 'Método',
  'setup.step.network': 'Red',
  'setup.wgReady': 'wg listo',
  'setup.wgMissing': 'falta wg',
  'setup.kernel': 'kernel',
  'setup.userspace': 'espacio de usuario',
  'setup.unknown': 'desconocido',
  'setup.fallback': 'alternativa: {name}',
  'setup.adminUsername': 'Usuario administrador',
  'setup.password': 'Contraseña',
  'setup.passwordHint': 'Al menos 6 caracteres.',
  'setup.confirmPassword': 'Confirmar contraseña',
  'setup.token': 'Token de configuración',
  'setup.methodIntro':
    'Se encontró una configuración de WireGuard existente en {dir}. ¿Cómo quieres continuar?',
  'setup.adopt': 'Adoptar "{name}"',
  'setup.adoptDetail':
    '{address} · puerto {port} · {count} par(es). El host seguirá gestionando la interfaz.',
  'setup.noAddress': 'sin dirección',
  'setup.startFresh': 'Empezar de cero',
  'setup.startFreshDetail':
    'Crea una configuración de servidor nueva gestionada por completo por esta app. Usa un nombre de interfaz/puerto distinto para evitar conflictos.',
  'setup.adopting': 'Adoptando "{name}"',
  'setup.adoptingDetail':
    'El ciclo de vida de la interfaz sigue siendo del host. Los pares importados del host no tienen clave privada, así que no se pueden generar configuraciones de cliente ni QR para ellos.',
  'setup.writeThrough': 'Escribir los cambios en la configuración del host',
  'setup.writeThroughDetail':
    'Mantén /etc/wireguard sincronizado (bidireccional). Recomendado.',
  'setup.endpoint': 'Endpoint público (host o IP)',
  'setup.endpointPlaceholder': 'vpn.example.com',
  'setup.detect': 'Detectar',
  'setup.endpointHint':
    'Dirección que usan los clientes para llegar a este servidor. Déjalo en blanco para configurarlo más tarde.',
  'setup.subnet': 'Subred (CIDR)',
  'setup.listenPort': 'Puerto de escucha',
  'setup.dns': 'DNS',
  'setup.mtu': 'MTU',
  'setup.fullTunnel': 'Túnel completo (enrutar todo el tráfico)',
  'setup.fullTunnelHint': 'Envía 0.0.0.0/0 a los clientes.',
  'setup.startInterface': 'Iniciar la interfaz ahora',
  'setup.startInterfaceMock': 'Simulado en modo de prueba.',
  'setup.startInterfaceHint': 'Levanta el túnel WireGuard de inmediato.',
  'setup.finish': 'Finalizar configuración',
  'setup.toast.detected': 'Endpoint público detectado: {endpoint}',
  'setup.toast.detectNoIp': 'No se pudo detectar una IP pública. Introdúcela manualmente.',
  'setup.toast.detectFailed': 'Error de detección. Introduce el endpoint manualmente.',
  'setup.toast.complete': 'Configuración completada. ¡Bienvenido!',
  'setup.toast.failed': 'Error en la configuración',
  'setup.usernameRequired': 'El usuario es obligatorio',
  'setup.passwordTooShort': 'La contraseña debe tener al menos 6 caracteres',
  'setup.passwordMismatch': 'La confirmación de contraseña no coincide',

  // Guide
  'guide.title': 'Guía de configuración de cliente',
  'guide.subtitle':
    'Cómo importar y activar una configuración de WireGuard en cada sistema operativo',
  'guide.getConfig.title': 'Primero obtén una configuración',
  'guide.getConfig.desc':
    'Cada dispositivo necesita su propio par para tener claves y una dirección únicas.',
  'guide.getConfig.qrTitle': 'Móvil (código QR)',
  'guide.getConfig.qrDesc': 'En Pares, haz clic en QR y escanéalo con la app de WireGuard.',
  'guide.getConfig.fileTitle': 'Escritorio (archivo .conf)',
  'guide.getConfig.fileDesc':
    'En Pares, haz clic en Config para descargar el archivo y luego impórtalo.',
  'guide.getConfig.goToPeers': 'Ir a Pares',
  'guide.steps.title': 'Instrucciones paso a paso',
  'guide.steps.desc': 'Elige tu sistema operativo.',
  'guide.os.android': 'Android',
  'guide.os.ios': 'iOS / iPadOS',
  'guide.os.windows': 'Windows',
  'guide.os.macos': 'macOS',
  'guide.os.linux': 'Linux',
  'guide.verify.title': 'Verifica la conexión',
  'guide.verify.intro':
    'Cuando el túnel esté activo, abre Pares y mira la tarjeta del dispositivo:',
  'guide.verify.handshake':
    'Un Handshake reciente (hace unos segundos) significa que el túnel está establecido.',
  'guide.verify.counters':
    'Los contadores de bajada / subida aumentan a medida que fluye el tráfico.',
  'guide.verify.badge': 'La insignia muestra el dispositivo como en línea.',
  'guide.trouble.title': 'Solución de problemas',
  'guide.trouble.noHandshakeTitle': 'Ningún handshake',
  'guide.trouble.noHandshakeBody':
    'Asegúrate de que la interfaz del servidor está en ejecución (Panel), de que el endpoint público está bien configurado (Ajustes) y de que se puede acceder al puerto de escucha por UDP desde la red del cliente.',
  'guide.trouble.linuxServiceTitle': 'Linux: el servicio no arranca',
  'guide.trouble.linuxServiceBody':
    'Usa el nombre de la interfaz en la unidad systemd: wg-quick@wg0, no wg-quick@wg0.conf. Revisa los errores con journalctl -xeu wg-quick@wg0.',
  'guide.trouble.tailscaleTitle': 'Tailscale u otra VPN deja de funcionar',
  'guide.trouble.tailscaleBody':
    'Un túnel completo (AllowedIPs = 0.0.0.0/0) se hace con la ruta predeterminada y puede interferir con el enrutado de políticas de Tailscale. Si solo necesitas la red VPN, configura IPs permitidas (enrutado del cliente) en Ajustes con tu subred de WireGuard (por ejemplo 10.8.0.0/24) y descarga la configuración de nuevo.',
  'guide.trouble.desktopQrTitle': 'El cliente de escritorio no puede escanear el código QR',
  'guide.trouble.desktopQrBody':
    'Los clientes de Windows y macOS importan archivos .conf. Usa Config para descargar el archivo en lugar del código QR.',

  // Guide steps
  'guide.android.1.title': 'Instala la app de WireGuard',
  'guide.android.1.body': 'Instala WireGuard desde Google Play o F-Droid.',
  'guide.android.2.title': 'Añade el túnel',
  'guide.android.2.body':
    'Abre la app y toca +, luego Escanear desde código QR. Escanea el QR que se muestra en la página Pares. Si descargaste el archivo .conf, elige Importar desde archivo o archivo comprimido.',
  'guide.android.3.title': 'Activa',
  'guide.android.3.body':
    'Toca el interruptor junto al túnel. Android pedirá permitir una conexión VPN; apruébala.',
  'guide.android.4.title': 'Verifica',
  'guide.android.4.body':
    'Aparece un icono de llave en la barra de estado y Pares muestra un handshake en unos segundos.',

  'guide.ios.1.title': 'Instala la app de WireGuard',
  'guide.ios.1.body': 'Instala WireGuard desde el App Store.',
  'guide.ios.2.title': 'Añade el túnel',
  'guide.ios.2.body':
    'Toca + y elige Crear desde código QR, luego escanea el QR que se muestra en la página Pares. Como alternativa, abre el archivo .conf descargado en la app Archivos y elige abrirlo con WireGuard.',
  'guide.ios.3.title': 'Activa',
  'guide.ios.3.body': 'Activa el túnel y acepta el aviso de configuración de VPN.',
  'guide.ios.4.title': 'Verifica',
  'guide.ios.4.body': 'El icono de VPN aparece en la barra de estado y Pares muestra un handshake.',

  'guide.windows.1.title': 'Instala el cliente de WireGuard',
  'guide.windows.1.body':
    'Descárgalo de wireguard.com/install o instálalo con winget:',
  'guide.windows.2.title': 'Importa la configuración',
  'guide.windows.2.body':
    'En Pares, haz clic en Config para descargar el archivo .conf. En el cliente WireGuard elige Añadir túnel → Importar túnel(es) desde archivo… y selecciónalo. El cliente de escritorio no puede escanear un código QR.',
  'guide.windows.3.title': 'Activa',
  'guide.windows.3.body': 'Haz clic en Activar.',
  'guide.windows.4.title': 'Verifica',
  'guide.windows.4.body':
    'El cliente muestra un Último handshake reciente y Pares en esta consola marca el dispositivo como en línea.',

  'guide.macos.1.title': 'Instala el cliente de WireGuard',
  'guide.macos.1.body':
    'Instala WireGuard desde el Mac App Store o, para la línea de comandos, usa Homebrew:',
  'guide.macos.2.title': 'Importa la configuración',
  'guide.macos.2.body':
    'Descarga el .conf desde Pares → Config. En la app elige Importar túnel(es) desde archivo… y selecciónalo.',
  'guide.macos.3.title': 'Activa',
  'guide.macos.3.body': 'Activa el túnel o, con la CLI:',
  'guide.macos.4.title': 'Verifica',
  'guide.macos.4.body': 'Comprueba el estado de la app o ejecuta:',

  'guide.linux.1.title': 'Instala wireguard-tools',
  'guide.linux.2.title': 'Coloca la configuración',
  'guide.linux.2.body':
    'Descarga el .conf desde Pares → Config y luego instálalo con permisos solo de root:',
  'guide.linux.3.title': 'Levanta o baja el túnel',
  'guide.linux.4.title': 'Iniciar automáticamente al arrancar',
  'guide.linux.4.body':
    'El nombre de la unidad systemd es el nombre de la interfaz sin el sufijo .conf:',
  'guide.linux.4.hint': 'Correcto: wg-quick@wg0 · Incorrecto: wg-quick@wg0.conf',
  'guide.linux.5.title': 'Verifica',
  'common.close': 'Cerrar',
};
