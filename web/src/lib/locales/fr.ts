import type { TranslationKey } from './en';

export const fr: Partial<Record<TranslationKey, string>> = {
  // Brand / shell
  'app.title': 'WireGuard',
  'app.subtitle': 'Console de gestion',

  // Navigation
  'nav.dashboard': 'Tableau de bord',
  'nav.peers': 'Pairs',
  'nav.guide': 'Guide',
  'nav.configs': 'Configurations',
  'nav.backup': 'Sauvegarde',
  'nav.settings': 'Paramètres',

  // Theme & account
  'theme.dark': 'Mode sombre',
  'theme.light': 'Mode clair',
  'theme.toggle': 'Changer de thème',
  'user.role': 'Administrateur',
  'user.logout': 'Se déconnecter',

  // Common
  'common.refresh': 'Actualiser',
  'common.cancel': 'Annuler',
  'common.confirm': 'Confirmer',
  'common.working': 'En cours…',
  'common.copy': 'Copier',
  'common.copied': 'Copié dans le presse-papiers',
  'common.copyFailed': 'Échec de la copie',
  'common.back': 'Retour',
  'common.continue': 'Continuer',
  'common.download': 'Télécharger',
  'common.remove': 'Supprimer',
  'common.delete': 'Supprimer',
  'common.qr': 'QR',
  'common.config': 'Config',
  'common.enabled': 'Activé',
  'common.disabled': 'Désactivé',
  'common.online': 'En ligne',
  'common.offline': 'Hors ligne',
  'common.running': 'En cours',
  'common.stopped': 'Arrêté',
  'common.never': 'Jamais',
  'common.notSet': 'Non défini',
  'common.loading': 'Chargement…',
  'common.udp': 'UDP',
  'common.import': 'Importer .conf',
  'common.language': 'Langue',
  'common.languageDesc': "Choisissez la langue de l'interface.",

  // Time formatting
  'time.secondsAgo': 'il y a {n}s',
  'time.minutesAgo': 'il y a {n}min',
  'time.hoursAgo': 'il y a {n}h',
  'time.daysAgo': 'il y a {n}j',

  // QR dialog
  'qr.download': 'Télécharger la configuration',
  'qr.alt': 'Code QR WireGuard',

  // Login
  'login.title': 'Console WireGuard',
  'login.subtitle': 'Connectez-vous pour gérer votre serveur VPN',
  'login.username': "Nom d'utilisateur",
  'login.password': 'Mot de passe',
  'login.submit': 'Se connecter',
  'login.failed': 'Échec de la connexion',

  // Dashboard
  'dashboard.title': 'Tableau de bord',
  'dashboard.subtitle': 'Aperçu et état de votre serveur WireGuard',
  'dashboard.mockWarning':
    'Mode simulé — aucune interface WireGuard réelle n’est active. Déployez sur un hôte Linux avec le module noyau WireGuard pour bénéficier de toutes les fonctionnalités.',
  'dashboard.endpointWarning':
    "L'endpoint public n'est pas défini. Configurez-le dans les Paramètres pour que les configs client générées contiennent une adresse joignable.",
  'dashboard.server': 'Serveur',
  'dashboard.interface': 'Interface {name}',
  'dashboard.adopted': 'Adoptée (externe)',
  'dashboard.adoptedNotice':
    "Cette interface a été adoptée à partir d'une configuration hôte existante. Son cycle de vie (démarrage/arrêt) est géré par l'hôte — les modifications des pairs sont appliquées à chaud.",
  'dashboard.adoptedWriteOn': 'Les modifications sont réécrites dans /etc/wireguard.',
  'dashboard.adoptedWriteOff':
    "Activez l'écriture dans les Paramètres pour persister les modifications dans la config de l'hôte.",
  'dashboard.wgUnavailable':
    "WireGuard n'est pas disponible : le module noyau est absent et aucun repli en espace utilisateur n'est installé. L'interface ne peut pas être démarrée sur cet hôte.",
  'dashboard.power': "Alimentation de l'interface",
  'dashboard.powerExternal': "Géré par l'hôte (systemd ou wg-quick)",
  'dashboard.powerUp': 'Le tunnel est actif et accepte les pairs',
  'dashboard.powerDown': 'Le tunnel est arrêté',
  'dashboard.restart': 'Redémarrer',
  'dashboard.peers': 'Pairs',
  'dashboard.onlineTotal': 'en ligne / total',
  'dashboard.listenPort': "Port d'écoute",
  'dashboard.endpoint': 'Endpoint',
  'dashboard.addressLabel': 'Adresse {addr}',
  'dashboard.backend': 'Backend',
  'dashboard.backendReal': 'WireGuard',
  'dashboard.backendMock': 'Simulé',
  'dashboard.wgDetected': 'wg détecté',
  'dashboard.wgNotFound': 'wg introuvable',
  'dashboard.peerActivity': 'Activité des pairs',
  'dashboard.peerActivityDesc': 'Statistiques de handshake et de transfert en direct',
  'dashboard.noPeers': 'Aucun pair actif pour le moment. Ajoutez-en un depuis la page Pairs.',
  'dashboard.noEndpoint': 'Aucun endpoint',
  'dashboard.handshake': 'handshake {time}',
  'dashboard.toast.started': 'Serveur démarré',
  'dashboard.toast.stopped': 'Serveur arrêté',
  'dashboard.toast.stateError': "Échec du changement d'état du serveur",
  'dashboard.toast.restarted': 'Serveur redémarré',
  'dashboard.toast.restartError': 'Échec du redémarrage du serveur',

  // Peers
  'peers.title': 'Pairs',
  'peers.subtitle': 'Appareils connectés à votre serveur WireGuard',
  'peers.add': 'Ajouter un pair',
  'peers.add.title': 'Ajouter un pair',
  'peers.add.description': 'De nouvelles clés et une adresse IP sont générées automatiquement.',
  'peers.add.name': 'Nom',
  'peers.add.namePlaceholder': 'ex. portable-faruq',
  'peers.add.extraAllowedIps': 'IP autorisées supplémentaires (facultatif)',
  'peers.add.extraAllowedIpsPlaceholder': '192.168.1.0/24',
  'peers.add.extraAllowedIpsHint':
    'Réseaux supplémentaires routés vers cet appareil (par exemple un LAN derrière lui). L’adresse de tunnel générée est toujours incluse, ce champ peut donc généralement rester vide.',
  'peers.add.keepalive': 'Keepalive persistant (facultatif)',
  'peers.add.psk': 'Utiliser une clé pré-partagée',
  'peers.add.pskHint': 'Ajoute une couche de sécurité supplémentaire.',
  'peers.add.create': 'Créer le pair',
  'peers.add.cancel': 'Annuler',
  'peers.adoptNotice':
    "Mode adoption : l'interface est gérée par l'hôte depuis /etc/wireguard. Les pairs importés depuis l'hôte n'ont pas de clé privée, donc QR/Config sont indisponibles pour eux. Ajoutez un pair ici, ou utilisez Recréer pour générer de nouvelles clés.",
  'peers.adoptNoticeWriteOn': "Les modifications sont réécrites dans la config de l'hôte.",
  'peers.adoptNoticeWriteOff':
    "Activez l'écriture dans les Paramètres pour persister les modifications dans la config de l'hôte.",
  'peers.imported':
    'Importé depuis une interface externe — clé privée indisponible, donc pas de config/QR client.',
  'peers.importedRekey': 'Utilisez « Recréer » pour générer une nouvelle clé (l’appareil doit la réimporter).',
  'peers.importedEnableWrite': "Activez l'écriture dans les Paramètres pour la recréer.",
  'peers.showQr': 'Afficher le code QR',
  'peers.privateKeyUnavailable': 'Clé privée indisponible',
  'peers.copyClientConfig': 'Copier la config client',
  'peers.downloadConfig': 'Télécharger la config client',
  'peers.regenKeys': 'Régénérer les clés',
  'peers.recreateKeys': 'Recréer avec de nouvelles clés (réimport requis sur l’appareil)',
  'peers.deletePeer': 'Supprimer le pair',
  'peers.enabled': 'Activé',
  'peers.handshake': 'Handshake {time}',
  'peers.loadFailed': 'Échec du chargement des pairs.',
  'peers.empty': 'Aucun pair pour le moment',
  'peers.emptyHint': 'Ajoutez votre premier pair pour générer une configuration et un code QR.',
  'peers.qrTitle': '{name} — code QR',
  'peers.qrDesc': "Scannez avec l'application WireGuard mobile pour importer ce pair.",
  'peers.deleteTitle': 'Supprimer le pair ?',
  'peers.deleteDesc': 'Cela supprime définitivement « {name} » et révoque son accès.',
  'peers.regenTitle': 'Régénérer les clés ?',
  'peers.recreateTitle': 'Recréer avec de nouvelles clés ?',
  'peers.regenDesc':
    "Le pair devra importer une nouvelle configuration ; l'ancienne cessera de fonctionner.",
  'peers.recreateDesc':
    "Une nouvelle paire de clés sera générée et écrite dans /etc/wireguard. L'appareil existant cessera de fonctionner jusqu'à ce qu'il importe la nouvelle configuration.",
  'peers.regenerate': 'Régénérer',
  'peers.recreate': 'Recréer',
  'peers.toast.created': 'Pair créé',
  'peers.toast.createFailed': 'Échec de la création du pair',
  'peers.toast.updateFailed': 'Échec de la mise à jour',
  'peers.toast.deleted': 'Pair supprimé',
  'peers.toast.deleteFailed': 'Échec de la suppression',
  'peers.toast.regen': 'Clés régénérées',
  'peers.toast.regenFailed': 'Échec de la régénération',

  // Client configs
  'clients.title': 'Configurations client',
  'clients.subtitle':
    "Importez et stockez des configurations WireGuard provenant d'autres serveurs ou clients",
  'clients.importedAt': 'Importée {date}',
  'clients.removeTitle': 'Supprimer la configuration ?',
  'clients.removeDesc': '« {name} » sera supprimée de la bibliothèque.',
  'clients.empty': 'Aucune configuration importée',
  'clients.emptyHint':
    'Importez un fichier WireGuard .conf pour le conserver ici en vue d’un téléchargement ou d’un partage QR rapide.',
  'clients.toast.removed': 'Configuration supprimée',
  'clients.toast.imported': '« {name} » importée',
  'clients.toast.importFailed': "Échec de l'import",
  'clients.toast.deleteFailed': 'Échec de la suppression',

  // Backup
  'backup.title': 'Sauvegarde et restauration',
  'backup.subtitle': 'Exportez ou importez toutes les données de WireGuard GUI',
  'backup.export': 'Exporter la sauvegarde',
  'backup.exportDesc':
    'Télécharge une archive ZIP contenant la base de données, la config serveur et les configs client importées.',
  'backup.download': 'Télécharger la sauvegarde',
  'backup.restore': 'Restaurer la sauvegarde',
  'backup.restoreDesc':
    'Importez une archive ZIP précédemment exportée. Vos données actuelles sont sauvegardées automatiquement avant d’être remplacées.',
  'backup.choose': 'Choisir le fichier de sauvegarde',
  'backup.warning':
    "La restauration remplace tous les pairs actuels, les paramètres serveur et les configs importées. L'interface WireGuard sera redémarrée si elle était activée.",
  'backup.confirmTitle': 'Restaurer cette sauvegarde ?',
  'backup.confirmDesc':
    '« {name} » écrasera les données actuelles. Une copie de sécurité des données actuelles est conservée sur le serveur.',
  'backup.confirmLabel': 'Restaurer',
  'backup.toast.restored': 'Sauvegarde restaurée — {count} pair(s)',
  'backup.toast.failed': 'Échec de la restauration',

  // Settings
  'settings.title': 'Paramètres',
  'settings.subtitle': 'Paramètres du serveur et sécurité du compte',
  'settings.server': 'Serveur',
  'settings.serverDesc': 'Ces valeurs déterminent la génération des configurations client.',
  'settings.endpoint': 'Endpoint public (hôte ou IP)',
  'settings.endpointPlaceholder': 'vpn.example.com',
  'settings.endpointHint': "Les clients se connectent à cette adresse sur le port d'écoute ci-dessous.",
  'settings.dns': 'DNS',
  'settings.clientRouting': 'IP autorisées (routage client)',
  'settings.listenPort': "Port d'écoute",
  'settings.mtu': 'MTU',
  'settings.keepalive': 'Keepalive persistant',
  'settings.subnet': 'Sous-réseau (CIDR)',
  'settings.address': 'Adresse du serveur',
  'settings.adoptReadOnly':
    "Les champs gérés par l'interface hôte (port, MTU, sous-réseau, adresse) sont en lecture seule en mode adoption.",
  'settings.publicKey': 'Clé publique du serveur',
  'settings.save': 'Enregistrer les modifications',
  'settings.toast.saved': 'Paramètres enregistrés',
  'settings.toast.saveFailed': "Échec de l'enregistrement des paramètres",
  'settings.language': 'Langue',
  'settings.changePassword': 'Changer le mot de passe',
  'settings.changePasswordDesc': "Modifier le mot de passe du compte administrateur.",
  'settings.currentPassword': 'Mot de passe actuel',
  'settings.newPassword': 'Nouveau mot de passe',
  'settings.confirmPassword': 'Confirmer le mot de passe',
  'settings.updatePassword': 'Mettre à jour le mot de passe',
  'settings.toast.passwordUpdated': 'Mot de passe mis à jour',
  'settings.toast.passwordFailed': 'Échec de la mise à jour du mot de passe',
  'settings.passwordTooShort': 'Le nouveau mot de passe doit comporter au moins 6 caractères',
  'settings.passwordMismatch': 'La confirmation du mot de passe ne correspond pas',
  'settings.hostSync': 'Synchronisation de la config hôte',
  'settings.hostSyncDesc': 'Garder /etc/wireguard synchronisé avec cette application (bidirectionnel).',
  'settings.writeThrough': "Écriture dans la config de l'hôte",
  'settings.writeThroughDesc':
    "Persiste les modifications des pairs dans le fichier de l'hôte afin qu'elles survivent aux redémarrages. Les modifications manuelles du fichier sont également importées automatiquement.",
  'settings.writeThroughToast': 'Écriture {state}',
  'settings.writeThroughOn': 'activée',
  'settings.writeThroughOff': 'désactivée',
  'settings.toast.writeThroughFailed': "Échec de la mise à jour de l'écriture",
  'settings.hostNotWritable':
    "La config de l'hôte n'est pas accessible en écriture. Assurez-vous que /etc/wireguard est monté en lecture-écriture dans docker-compose.yml (et ajoutez :z sur les systèmes SELinux).",
  'settings.hostWritable': "La config de l'hôte est accessible en écriture",
  'settings.reapply': 'Réappliquer maintenant',
  'settings.toast.reapplied': "Réappliqué à la config de l'hôte et à l'interface",
  'settings.toast.reapplyFailed': 'Échec de la réapplication',

  // Setup wizard
  'setup.title': 'Bienvenue — procédons à la configuration',
  'setup.subtitle': 'Créez votre compte administrateur et configurez le serveur WireGuard.',
  'setup.wgDetected': 'WireGuard détecté',
  'setup.mockMode': 'Mode simulé',
  'setup.step.account': 'Compte',
  'setup.step.method': 'Méthode',
  'setup.step.network': 'Réseau',
  'setup.wgReady': 'wg prêt',
  'setup.wgMissing': 'wg manquant',
  'setup.kernel': 'noyau',
  'setup.userspace': 'espace utilisateur',
  'setup.unknown': 'inconnu',
  'setup.fallback': 'repli : {name}',
  'setup.adminUsername': "Nom d'utilisateur admin",
  'setup.password': 'Mot de passe',
  'setup.passwordHint': 'Au moins 6 caractères.',
  'setup.confirmPassword': 'Confirmer le mot de passe',
  'setup.token': 'Jeton de configuration',
  'setup.methodIntro':
    'Une configuration WireGuard existante a été trouvée dans {dir}. Comment souhaitez-vous procéder ?',
  'setup.adopt': 'Adopter « {name} »',
  'setup.adoptDetail':
    "{address} · port {port} · {count} pair(s). L'hôte continuera de gérer l'interface.",
  'setup.noAddress': 'aucune adresse',
  'setup.startFresh': 'Repartir de zéro',
  'setup.startFreshDetail':
    "Créer une nouvelle configuration serveur gérée entièrement par cette application. Utilisez un nom d'interface/port différent pour éviter les conflits.",
  'setup.adopting': 'Adoption de « {name} »',
  'setup.adoptingDetail':
    "Le cycle de vie de l'interface reste géré par l'hôte. Les pairs importés depuis l'hôte n'ont pas de clé privée, donc les configs/QR client ne peuvent pas être générés pour eux.",
  'setup.writeThrough': "Écrire les modifications dans la config de l'hôte",
  'setup.writeThroughDetail': 'Garder /etc/wireguard synchronisé (bidirectionnel). Recommandé.',
  'setup.endpoint': 'Endpoint public (hôte ou IP)',
  'setup.endpointPlaceholder': 'vpn.example.com',
  'setup.detect': 'Détecter',
  'setup.endpointHint':
    'Adresse utilisée par les clients pour joindre ce serveur. Laissez vide pour la définir plus tard.',
  'setup.subnet': 'Sous-réseau (CIDR)',
  'setup.listenPort': "Port d'écoute",
  'setup.dns': 'DNS',
  'setup.mtu': 'MTU',
  'setup.fullTunnel': 'Tunnel complet (router tout le trafic)',
  'setup.fullTunnelHint': 'Pousse 0.0.0.0/0 vers les clients.',
  'setup.startInterface': "Démarrer l'interface maintenant",
  'setup.startInterfaceMock': 'Simulé en mode simulé.',
  'setup.startInterfaceHint': 'Monter le tunnel WireGuard immédiatement.',
  'setup.finish': 'Terminer la configuration',
  'setup.toast.detected': 'Endpoint public détecté : {endpoint}',
  'setup.toast.detectNoIp': 'Impossible de détecter une IP publique. Saisissez-la manuellement.',
  'setup.toast.detectFailed': "Échec de la détection. Saisissez l'endpoint manuellement.",
  'setup.toast.complete': 'Configuration terminée. Bienvenue !',
  'setup.toast.failed': 'Échec de la configuration',
  'setup.usernameRequired': "Le nom d'utilisateur est requis",
  'setup.passwordTooShort': 'Le mot de passe doit comporter au moins 6 caractères',
  'setup.passwordMismatch': 'La confirmation du mot de passe ne correspond pas',

  // Guide
  'guide.title': 'Guide de configuration client',
  'guide.subtitle':
    "Comment importer et activer une configuration WireGuard sur chaque système d'exploitation",
  'guide.getConfig.title': "Obtenez d'abord une configuration",
  'guide.getConfig.desc':
    'Chaque appareil a besoin de son propre pair pour obtenir des clés uniques et une adresse.',
  'guide.getConfig.qrTitle': 'Mobile (code QR)',
  'guide.getConfig.qrDesc': "Dans Pairs, cliquez sur QR et scannez-le avec l'application WireGuard.",
  'guide.getConfig.fileTitle': 'Bureau (fichier .conf)',
  'guide.getConfig.fileDesc':
    'Dans Pairs, cliquez sur Config pour télécharger le fichier, puis importez-le.',
  'guide.getConfig.goToPeers': 'Aller à Pairs',
  'guide.steps.title': 'Instructions pas à pas',
  'guide.steps.desc': "Choisissez votre système d'exploitation.",
  'guide.os.android': 'Android',
  'guide.os.ios': 'iOS / iPadOS',
  'guide.os.windows': 'Windows',
  'guide.os.macos': 'macOS',
  'guide.os.linux': 'Linux',
  'guide.verify.title': 'Vérifier la connexion',
  'guide.verify.intro':
    'Une fois le tunnel actif, ouvrez Pairs et consultez la fiche de l’appareil :',
  'guide.verify.handshake':
    'Un Handshake récent (il y a quelques secondes) signifie que le tunnel est établi.',
  'guide.verify.counters': 'Les compteurs descendant / montant augmentent au fil du trafic.',
  'guide.verify.badge': "Le badge indique que l'appareil est en ligne.",
  'guide.trouble.title': 'Dépannage',
  'guide.trouble.noHandshakeTitle': 'Aucun handshake',
  'guide.trouble.noHandshakeBody':
    "Assurez-vous que l'interface serveur est en cours d'exécution (Tableau de bord), que l'endpoint public est correctement défini (Paramètres) et que le port d'écoute est joignable en UDP depuis le réseau client.",
  'guide.trouble.linuxServiceTitle': 'Linux : le service ne démarre pas',
  'guide.trouble.linuxServiceBody':
    "Utilisez le nom d'interface dans l'unité systemd : wg-quick@wg0, et non wg-quick@wg0.conf. Inspectez les erreurs avec journalctl -xeu wg-quick@wg0.",
  'guide.trouble.tailscaleTitle': 'Tailscale ou un autre VPN cesse de fonctionner',
  'guide.trouble.tailscaleBody':
    "Un tunnel complet (AllowedIPs = 0.0.0.0/0) prend en charge la route par défaut et peut interférer avec le routage de politique Tailscale. Si vous n'avez besoin que du réseau VPN, définissez IP autorisées (routage client) dans les Paramètres sur votre sous-réseau WireGuard (par exemple 10.8.0.0/24) et téléchargez à nouveau la configuration.",
  'guide.trouble.desktopQrTitle': 'Le client bureau ne peut pas scanner le code QR',
  'guide.trouble.desktopQrBody':
    'Les clients Windows et macOS importent des fichiers .conf. Utilisez Config pour télécharger le fichier au lieu du code QR.',

  // Guide steps
  'guide.android.1.title': "Installer l'application WireGuard",
  'guide.android.1.body': 'Installez WireGuard depuis Google Play ou F-Droid.',
  'guide.android.2.title': 'Ajouter le tunnel',
  'guide.android.2.body':
    "Ouvrez l'application, touchez +, puis Scanner depuis un code QR. Scannez le QR affiché sur la page Pairs. Si vous avez téléchargé le fichier .conf, choisissez plutôt Importer depuis un fichier ou une archive.",
  'guide.android.3.title': 'Activer',
  'guide.android.3.body':
    "Touchez l'interrupteur à côté du tunnel. Android demande d'autoriser une connexion VPN — acceptez.",
  'guide.android.4.title': 'Vérifier',
  'guide.android.4.body':
    "Une icône de clé apparaît dans la barre d'état, et Pairs affiche un handshake en quelques secondes.",

  'guide.ios.1.title': "Installer l'application WireGuard",
  'guide.ios.1.body': "Installez WireGuard depuis l'App Store.",
  'guide.ios.2.title': 'Ajouter le tunnel',
  'guide.ios.2.body':
    "Touchez + et choisissez Créer depuis un code QR, puis scannez le QR affiché sur la page Pairs. Sinon, ouvrez le fichier .conf téléchargé dans l'app Fichiers et choisissez de l'ouvrir avec WireGuard.",
  'guide.ios.3.title': 'Activer',
  'guide.ios.3.body': "Activez le tunnel et acceptez l'invite de configuration VPN.",
  'guide.ios.4.title': 'Vérifier',
  'guide.ios.4.body': "L'icône VPN apparaît dans la barre d'état, et Pairs affiche un handshake.",

  'guide.windows.1.title': 'Installer le client WireGuard',
  'guide.windows.1.body':
    'Téléchargez-le sur wireguard.com/install, ou installez-le avec winget :',
  'guide.windows.2.title': 'Importer la configuration',
  'guide.windows.2.body':
    'Dans Pairs, cliquez sur Config pour télécharger le fichier .conf. Dans le client WireGuard, choisissez Ajouter un tunnel → Importer un/des tunnel(s) depuis un fichier… et sélectionnez-le. Le client bureau ne peut pas scanner de code QR.',
  'guide.windows.3.title': 'Activer',
  'guide.windows.3.body': 'Cliquez sur Activer.',
  'guide.windows.4.title': 'Vérifier',
  'guide.windows.4.body':
    'Le client affiche un Dernier handshake récent, et Pairs sur cette console marque l’appareil comme en ligne.',

  'guide.macos.1.title': 'Installer le client WireGuard',
  'guide.macos.1.body':
    'Installez WireGuard depuis le Mac App Store, ou en ligne de commande avec Homebrew :',
  'guide.macos.2.title': 'Importer la configuration',
  'guide.macos.2.body':
    'Téléchargez le .conf depuis Pairs → Config. Dans l’app, choisissez Importer un/des tunnel(s) depuis un fichier… et sélectionnez-le.',
  'guide.macos.3.title': 'Activer',
  'guide.macos.3.body': 'Activez le tunnel, ou via la CLI :',
  'guide.macos.4.title': 'Vérifier',
  'guide.macos.4.body': "Consultez l'état de l'app, ou exécutez :",

  'guide.linux.1.title': 'Installer wireguard-tools',
  'guide.linux.2.title': 'Placer la configuration',
  'guide.linux.2.body':
    'Téléchargez le .conf depuis Pairs → Config, puis installez-le avec des permissions root uniquement :',
  'guide.linux.3.title': 'Monter ou arrêter le tunnel',
  'guide.linux.4.title': 'Démarrer automatiquement au boot',
  'guide.linux.4.body':
    "Le nom de l'unité systemd est le nom d'interface sans le suffixe .conf :",
  'guide.linux.4.hint': 'Correct : wg-quick@wg0 · Incorrect : wg-quick@wg0.conf',
  'guide.linux.5.title': 'Vérifier',
  'common.close': 'Fermer',
};
