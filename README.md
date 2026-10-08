# WireGuard GUI

A simple, self-hosted web application to manage a **WireGuard server** and to
store/download **WireGuard client configurations** — all inside a single Docker
container. Modern, mobile-friendly interface with a first-run setup wizard.

![status](https://img.shields.io/badge/status-active-brightgreen)

## Features

- **First-run setup wizard**: create the admin account and configure the server
  from the browser — no `.env` editing required.
- **Server management**: start/stop/restart the interface, edit listen port,
  subnet, MTU, DNS, endpoint and NAT settings.
- **Peer management**: create peers with auto-generated keys and IP addresses,
  enable/disable, regenerate keys, delete.
- **Client configs**: download `.conf` files and scan **QR codes** directly from
  the browser.
- **Config library**: import existing `.conf` files from other servers/clients,
  store them, then download or show their QR code.
- **Live status**: handshake time and RX/TX transfer per peer, online/offline.
- **Backup & restore**: export the whole state (database + configs) to a ZIP and
  restore it with an automatic safety copy.
- **Authentication**: simple admin login with hashed passwords and sessions.
- **Dark/light theme** and a responsive layout (desktop sidebar + mobile bottom nav).

## Tech stack

| Layer    | Technology                                        |
| -------- | ------------------------------------------------- |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Radix UI |
| Backend  | Node.js 24, Fastify, TypeScript                   |
| Database | SQLite (built-in `node:sqlite`)                   |
| Runtime  | Docker (WireGuard tools + iptables)               |

> **Note on the database:** this project uses Node's built-in `node:sqlite`
> module, so there is **no native compilation step** and no `better-sqlite3`.

## Quick start

On a Linux host with a public IP:

```bash
git clone <your-repo-url> wireguard-gui
cd wireguard-gui
docker compose up -d --build
```

Then open `http://<server-ip>:3000` and follow the **setup wizard**:

1. Create your administrator account.
2. If an existing WireGuard configuration is found in `/etc/wireguard`, choose
   to **adopt** it or start fresh.
3. Confirm the network settings (the public endpoint is detected and filled in
   automatically) and finish.

That's it. No `.env` file is required.

> The compose file uses **host networking** (required so the app can manage the
> WireGuard interface and adopt host configs). It needs Linux; on macOS/Windows
> use `npm run dev` with `MOCK_MODE=true` for UI development.

### Existing WireGuard on the host

On first start the app looks for configurations in `/etc/wireguard` and always
asks how to proceed:

- **Adopt** — imports the interface settings and peers into the GUI. The host
  keeps owning the interface lifecycle (start/stop is disabled in the GUI), and
  peer changes are applied live via `wg syncconf`.
  - **Two-way sync**: with *write-through* enabled (default), every change is
    also written back to the host `wg0.conf`, and manual edits to that file are
    imported back into the app automatically (a file watcher is used). The
    `[Interface]` block is preserved verbatim; only `[Peer]` blocks are managed
    by the app. A backup is written to `data/backups/wgconfig/` before each write.
  - Peers imported from the host have no private key, so client configs/QR codes
    cannot be generated for them. Use **Recreate** to generate a new key pair for
    such a peer (the device must re-import the new configuration).
- **Start fresh** — creates a new server configuration managed by the app. A
  safety guard refuses to touch an existing interface it does not own.

The image bundles a userspace implementation (`wireguard-go`). If the host
kernel has no WireGuard module, the interface is brought up with the userspace
fallback automatically.

> The compose file mounts `/etc/wireguard` **read-write** for two-way sync. On
> SELinux systems append `:z` (e.g. `/etc/wireguard:/etc/wireguard:z`). If the
> directory is not writable, write-through is disabled automatically (with a
> warning in Settings), while imports keep working.

### Optional configuration

If you prefer to configure things ahead of time (or need headless/automation
deploys), copy the example file and adjust it:

```bash
cp .env.example .env
```

| Variable                  | Default        | Description                                                |
| ------------------------- | -------------- | ---------------------------------------------------------- |
| `PORT`                    | `3000`         | Web UI port                                                |
| `SESSION_SECRET`          | auto           | Secret for cookies (auto-generated & persisted if empty)   |
| `COOKIE_SECURE`           | `false`        | Set `true` when serving over HTTPS                         |
| `ADMIN_USERNAME`          | `admin`        | Admin username                                             |
| `ADMIN_PASSWORD`          | –              | If set, admin is created automatically and the wizard is skipped |
| `SETUP_TOKEN`             | –              | If set, required to run the setup wizard                   |
| `WG_INTERFACE`            | `wg0`          | Interface name                                             |
| `WG_SUBNET`               | `10.8.0.0/24`  | Peer subnet                                                |
| `WG_PORT`                 | `51820`        | WireGuard listen port                                      |
| `WG_ENDPOINT`             | `auto`         | Public host/IP clients connect to (`auto` = set in wizard) |
| `WG_DNS`                  | `1.1.1.1`      | DNS pushed to clients                                      |
| `WG_ALLOWED_IPS`          | `0.0.0.0/0`    | Routes pushed to clients (full tunnel)                     |
| `WG_PERSISTENT_KEEPALIVE` | `25`           | Default keepalive                                          |
| `WG_MTU`                  | `1420`         | Interface MTU                                              |
| `WG_EGRESS_INTERFACE`     | auto           | Outbound interface used for NAT                            |
| `HOST_WG_DIR`             | `/etc/wireguard` | Directory with existing host configs (read-only)         |
| `WG_USERSPACE_FALLBACK`   | `true`         | Use `wireguard-go` when the kernel module is missing       |
| `DATA_DIR`                | `./data`       | Directory for the database and configs                     |
| `MOCK_MODE`               | `false`        | Force mock mode (no real WireGuard binary)                 |

### Bridge network mode (alternative)

If you cannot use host networking, you can switch to a bridge network with
published ports. Note that **adoption of host interfaces will not work** in that
mode (the container has its own network namespace):

```yaml
    network_mode: bridge      # remove this
    ports:
      - "3000:3000"
      - "51820:51820/udp"
    sysctls:
      - net.ipv4.ip_forward=1
```

## Using the app

1. **Dashboard** – see status and toggle the interface power switch.
2. **Peers** – add a peer, then use **QR** or **Config** to connect a device. The
   optional *Extra allowed IPs* field routes additional networks to a device
   (e.g. a LAN behind it); the device's tunnel address is always included.
3. **Configs** – import `.conf` files from elsewhere and keep them handy.
4. **Settings** – change the public endpoint, DNS, subnet, port, and password.
   Changing the interface address, subnet, or MTU rebuilds the WireGuard
   interface (connected clients reconnect automatically); other changes are
   applied live.
5. **Backup** – export a ZIP regularly; restore it any time.

## Local development

Requirements: Node.js >= 22.5.

```bash
npm install
cp .env.example .env        # set MOCK_MODE=true on macOS
npm run dev                 # starts backend (:3000) + Vite (:5173)
```

The Vite dev server proxies `/api` to the backend, so open
`http://localhost:5173`. On a fresh data directory the setup wizard appears.

### Why mock mode?

WireGuard needs the kernel module and `NET_ADMIN` capabilities, which are not
available in Docker Desktop on macOS/Windows. Use `MOCK_MODE=true` to develop
the UI locally. On a Linux VPS, leave it `false` and the app uses the real
`wg`/`wg-quick` binaries.

### Scripts

| Command              | Description                                  |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Run backend and frontend in watch mode       |
| `npm run build`      | Build the frontend and bundle the backend    |
| `npm start`          | Start the production server (from `dist`)    |
| `npm test`           | Run backend unit tests                       |
| `npm run typecheck`  | Type-check backend and frontend              |
| `npm run lint`       | Lint backend and frontend                    |

## API overview

All routes are served under `/api`. Public routes: `health`, `setup/*`,
`auth/login`, `auth/logout`, `auth/me`. Everything else requires an
authenticated session.

```
GET    /api/setup/status          POST   /api/setup
GET    /api/setup/detect-endpoint
POST   /api/auth/login            POST   /api/auth/logout
GET    /api/auth/me               POST   /api/auth/password
GET    /api/server/config         PATCH  /api/server/config
GET    /api/server/status         POST   /api/server/{up|down|restart}
GET    /api/peers                 POST   /api/peers
PATCH  /api/peers/:id             DELETE /api/peers/:id
POST   /api/peers/:id/regenerate  GET    /api/peers/:id/{config|qr}
GET    /api/clients               POST   /api/clients      (multipart)
DELETE /api/clients/:id           GET    /api/clients/:id/{config|qr}
GET    /api/backup                POST   /api/backup/restore (multipart)
```

## Backup & restore

- **Export** downloads `wireguard-gui-backup-<timestamp>.zip` containing
  `wg.db`, `configs/` and a `manifest.json`.
- **Restore** validates the archive, copies the current data to
  `data/backups/<timestamp>/` for safety, then replaces the database and
  configs. If the interface was enabled it is restarted automatically.

## Security notes

- Complete the setup wizard immediately after the first start: until an admin
  exists, the setup endpoint is open to anyone who can reach the server. Set
  `SETUP_TOKEN` to require a secret for extra protection.
- Set `ADMIN_PASSWORD` and a strong `SESSION_SECRET` (or let them auto-generate)
  and avoid the default credentials.
- Put the app behind a TLS reverse proxy (Caddy, Nginx, Traefik) and set
  `COOKIE_SECURE=true` for internet-facing deployments.
- The WireGuard private keys and psk are stored in the SQLite database — protect
  the `data/` volume and its backups.
- Running the container requires `NET_ADMIN` (and usually `SYS_MODULE`) because
  it configures the WireGuard interface, routes and iptables NAT rules.

## Project structure

```
wireguard-gui/
├── Dockerfile                  # multi-stage build (web + server)
├── docker-compose.yml          # single-service deployment
├── server/                     # Fastify + TypeScript backend
│   └── src/{routes,services,wg,db,auth}
└── web/                        # React + Vite frontend
    └── src/{pages,components,layouts,hooks,lib}
```

## License

MIT
