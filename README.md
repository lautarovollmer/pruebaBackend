# 💳 Billetera Virtual - SOAP + REST (NestJS)

Este proyecto simula una **billetera virtual** con dos servicios:

- **SOAP**: el único que accede a la base de datos (usa TypeORM + MySQL).
- **REST (NestJS)**: actúa como **puente**, consumiendo los métodos SOAP y exponiendo endpoints REST.

---

## 🚀 Tecnologías usadas

- **Node.js** + **NestJS**
- **TypeScript**
- **TypeORM**
- **MySQL**
- **SOAP** (paquete `soap`)
- **Nodemailer** (para enviar tokens)
- **dotenv**

## ⚙️ Configuración

      1. Cloná el repositorio:
         ```bash
         git clone https://github.com/lautarovollmer/pruebaBackend
         ```

      2. Entrá a las carpetas de los servicios:
         ```bash
         cd soap-wallet
         npm install

         cd ../rest-wallet
         npm install
         ```

      3. Configurá tus variables de entorno:
         ```bash
         cp .env.example .env
         ```

      4. Creá la base de datos MySQL:
         ```sql
         CREATE DATABASE wallet_db;
         ```

      ---

### 1️⃣ Levantar el SOAP

      ```bash
      cd soap-wallet
      npm run start:dev
      ```
      El servicio SOAP quedará disponible en:
      `http://localhost:4000/wsdl?wsdl`

      ### 2️⃣ Levantar el REST
      ```bash
      cd rest-wallet
      npm run start:dev
      ```
      El servicio REST quedará disponible en:
      `http://localhost:3000`

      ---
      ## 🧪 Endpoints REST

      | Método | Endpoint | Descripción |
      |---------|-----------|-------------|
      | POST | `/wallet/register` | Registra un nuevo cliente |
      | POST | `/wallet/recharge` | Recarga saldo en la billetera |
      | POST | `/wallet/pay` | Inicia un pago (envía token de confirmación por email) |
      | POST | `/wallet/confirm` | Confirma el pago con el token |
      | GET | `/wallet/balance` | Consulta el saldo actual |

      ---


