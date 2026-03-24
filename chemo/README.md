# 🛡️ Laboratorio de Ciberseguridad — Inyecciones Web

> ⚠️ **ADVERTENCIA:** Este proyecto es un **laboratorio educativo** para la materia de Ciberseguridad. Todas las credenciales, contraseñas y datos sensibles incluidos en el código son **completamente ficticios** y de prueba. **No utilizar en producción.**

## 📋 Descripción

Aplicación web diseñada para demostrar y practicar diferentes tipos de **vulnerabilidades de inyección** en un entorno controlado. Incluye un servidor vulnerable intencional con endpoints que permiten explotar cada tipo de ataque.

## 🎯 Tipos de Inyección Incluidos

| # | Tipo | Endpoint | Descripción |
|---|------|----------|-------------|
| 1 | **SQL Injection** | `POST /login` | Concatenación directa en consultas SQLite |
| 2 | **NoSQL Injection** | `POST /nosql-login` | Operadores MongoDB (`$ne`, `$gt`, `$regex`, etc.) |
| 3 | **LDAP Injection** | `POST /ldap-login` | Manipulación de filtros LDAP |
| 4 | **XPath Injection** | `POST /xpath-login` | Inyección en consultas XPath sobre XML |
| 5 | **GraphQL Injection** | `POST /graphql` | Introspección, enumeración y mutaciones sin auth |

## 🚀 Instalación y Uso

### Prerrequisitos

- [Node.js](https://nodejs.org/) v18 o superior
- npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Maxxow/chemo.git
cd chemo

# Instalar dependencias
npm install
```

### Ejecución

```bash
# Servidor seguro (login normal con consultas parametrizadas)
npm start

# Servidor vulnerable (laboratorio de inyecciones)
npm run vulnerable
```

El servidor estará disponible en `http://localhost:3001`

- **Login:** `http://localhost:3001/`
- **Laboratorio de inyecciones:** `http://localhost:3001/lab`

## 🔑 Credenciales de Prueba

> **Todas las credenciales listadas a continuación son ficticias y fueron creadas exclusivamente para este laboratorio.**

### SQL (SQLite)
| Usuario | Contraseña |
|---------|------------|
| administrador | pruebadeacceso1 |

### NoSQL (Simulación MongoDB)
| Usuario | Contraseña |
|---------|------------|
| admin | password123 |
| carlos | carlos2024 |
| root | toor |

### LDAP (Simulado)
| UID | Password |
|-----|----------|
| admin | ldap_admin_pass |
| jperez | juan123 |
| root | r00tpass |

### XPath (XML)
| Username | Password |
|----------|----------|
| admin | xpath_admin_pass |
| carlos | carlos_xpath |
| root | r00t_xpath |

### GraphQL
| Username | Password |
|----------|----------|
| admin | gql_admin_pass |
| root | r00t_graphql |

## 🛠️ Tecnologías

- **Backend:** Node.js, Express
- **Base de datos:** SQLite (better-sqlite3)
- **GraphQL:** graphql, graphql-http
- **XML/XPath:** xpath, @xmldom/xmldom
- **Sesiones:** express-session

## 📂 Estructura del Proyecto

```
├── server.js                # Servidor seguro (consultas parametrizadas)
├── server_vulnerable.js     # Servidor vulnerable (para prácticas)
├── package.json
├── public/
│   ├── index.html           # Página de login
│   ├── dashboard.html       # Dashboard post-login
│   ├── injections.html      # Laboratorio de inyecciones
│   ├── style.css            # Estilos del login/dashboard
│   └── injections.css       # Estilos del laboratorio
└── usuarios.db              # Base de datos SQLite (auto-generada)
```

## ⚠️ Disclaimer

Este proyecto fue desarrollado con **fines estrictamente educativos** como parte de un curso de Ciberseguridad. Su propósito es:

- ✅ Entender cómo funcionan las vulnerabilidades de inyección
- ✅ Practicar técnicas de pentesting en un entorno seguro
- ✅ Aprender a identificar y mitigar estos ataques

**No debe utilizarse para:**

- ❌ Atacar sistemas sin autorización
- ❌ Uso en entornos de producción
- ❌ Actividades ilegales de cualquier tipo

## 📄 Licencia

Proyecto académico — Uso educativo únicamente.
