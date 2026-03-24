/**
 * ⚠️  VERSIÓN VULNERABLE - SOLO PARA FINES EDUCATIVOS ⚠️
 * 
 * Este servidor tiene VULNERABILIDADES INTENCIONALES de:
 *   - Inyección SQL
 *   - Inyección NoSQL
 *   - Inyección LDAP
 *   - Inyección XPath
 *   - Inyección GraphQL
 * 
 * NUNCA uses este código en producción.
 */

const express = require('express');
const Database = require('better-sqlite3');
const session = require('express-session');
const path = require('path');
const { buildSchema, graphql } = require('graphql');
const xpath = require('xpath');
const { DOMParser } = require('@xmldom/xmldom');

const app = express();
const PORT = 3002;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'ciberseguridad-secret-key',
    resave: false,
    saveUninitialized: false
}));

// ── Base de datos SQLite ────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'usuarios.db'));

// Crear tabla de usuarios si no existe
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT UNIQUE NOT NULL,
    contrasena TEXT NOT NULL
  )
`);

// Insertar usuario predeterminado si no existe
const existe = db.prepare('SELECT COUNT(*) as count FROM usuarios WHERE usuario = ?').get('administrador');
if (existe.count === 0) {
    db.prepare('INSERT INTO usuarios (usuario, contrasena) VALUES (?, ?)').run('administrador', 'pruebadeacceso1');
    console.log('✅ Usuario "administrador" creado en la base de datos.');
}

// ══════════════════════════════════════════════════════════════════════
// DATOS SIMULADOS PARA LOS DIFERENTES TIPOS DE INYECCIÓN
// ══════════════════════════════════════════════════════════════════════

// ── "Base de datos" NoSQL simulada (simula MongoDB) ──────────────────
const nosqlUsers = [
    { _id: '1', usuario: 'admin', contrasena: 'password123', rol: 'administrador' },
    { _id: '2', usuario: 'carlos', contrasena: 'carlos2024', rol: 'editor' },
    { _id: '3', usuario: 'maria', contrasena: 'maria_segura', rol: 'usuario' },
    { _id: '4', usuario: 'root', contrasena: 'toor', rol: 'superadmin' }
];

// ── Directorio LDAP simulado ────────────────────────────────────────
const ldapDirectory = [
    { uid: 'admin', userPassword: 'ldap_admin_pass', cn: 'Administrador', mail: 'admin@empresa.com', role: 'admin' },
    { uid: 'jperez', userPassword: 'juan123', cn: 'Juan Pérez', mail: 'jperez@empresa.com', role: 'usuario' },
    { uid: 'mlopez', userPassword: 'maria456', cn: 'María López', mail: 'mlopez@empresa.com', role: 'manager' },
    { uid: 'root', userPassword: 'r00tpass', cn: 'Root', mail: 'root@empresa.com', role: 'superadmin' }
];

// ── Documento XML para XPath ────────────────────────────────────────
const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user>
    <username>admin</username>
    <password>xpath_admin_pass</password>
    <role>administrador</role>
    <email>admin@empresa.com</email>
  </user>
  <user>
    <username>carlos</username>
    <password>carlos_xpath</password>
    <role>editor</role>
    <email>carlos@empresa.com</email>
  </user>
  <user>
    <username>ana</username>
    <password>ana_segura_2024</password>
    <role>usuario</role>
    <email>ana@empresa.com</email>
  </user>
  <user>
    <username>root</username>
    <password>r00t_xpath</password>
    <role>superadmin</role>
    <email>root@empresa.com</email>
  </user>
</users>`;

const xmlDoc = new DOMParser().parseFromString(xmlData, 'text/xml');

// ── Datos para GraphQL ──────────────────────────────────────────────
const graphqlUsers = [
    { id: 1, username: 'admin', password: 'gql_admin_pass', role: 'administrador', email: 'admin@empresa.com' },
    { id: 2, username: 'carlos', password: 'carlos_gql', role: 'editor', email: 'carlos@empresa.com' },
    { id: 3, username: 'maria', password: 'maria_gql_2024', role: 'manager', email: 'maria@empresa.com' },
    { id: 4, username: 'root', password: 'r00t_graphql', role: 'superadmin', email: 'root@empresa.com' }
];

const graphqlConfigs = [
    { key: 'DB_HOST', value: 'internal-db.empresa.local' },
    { key: 'DB_PASSWORD', value: 'sup3r_s3cr3t_db_p4ss!' },
    { key: 'API_KEY', value: 'sk-1234567890abcdef' },
    { key: 'JWT_SECRET', value: 'my_jwt_secret_key_never_share' }
];

// ══════════════════════════════════════════════════════════════════════
// RUTAS
// ══════════════════════════════════════════════════════════════════════

// Página principal — redirige al login
app.get('/', (req, res) => {
    if (req.session.usuario) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Página del laboratorio de inyecciones
app.get('/lab', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'injections.html'));
});

// ╔══════════════════════════════════════════════════════════════════╗
// ║  🚨 1. INYECCIÓN SQL                                           ║
// ╚══════════════════════════════════════════════════════════════════╝
app.post('/login', (req, res) => {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
        return res.json({ success: false, message: 'Por favor, completa todos los campos.' });
    }

    // 🚨 VULNERABLE — concatenación directa en la consulta SQL
    const query = `SELECT * FROM usuarios WHERE usuario = '${usuario}' AND contrasena = '${contrasena}'`;

    console.log('\n🗄️  ═══ INYECCIÓN SQL ═══════════════════════════════');
    console.log('📝 Consulta:', query);
    console.log('════════════════════════════════════════════════════\n');

    try {
        const user = db.prepare(query).get();

        if (user) {
            req.session.usuario = user.usuario;
            return res.json({ success: true, message: `¡Bienvenido, ${user.usuario}! (SQL Injection exitosa)` });
        } else {
            return res.json({ success: false, message: 'Usuario o contraseña incorrectos.' });
        }
    } catch (err) {
        console.log(`💥 Error SQL: ${err.message}`);
        return res.json({ success: false, message: `Error en la consulta: ${err.message}` });
    }
});

// ╔══════════════════════════════════════════════════════════════════╗
// ║  🚨 2. INYECCIÓN NoSQL (simula MongoDB)                        ║
// ╚══════════════════════════════════════════════════════════════════╝
app.post('/nosql-login', (req, res) => {
    const { usuario, contrasena } = req.body;

    if (usuario === undefined || contrasena === undefined) {
        return res.json({ success: false, message: 'Por favor, completa todos los campos.' });
    }

    console.log('\n🍃 ═══ INYECCIÓN NoSQL ════════════════════════════');
    console.log('📝 Recibido:', JSON.stringify({ usuario, contrasena }));

    // 🚨 VULNERABLE — acepta objetos JSON con operadores MongoDB
    // En una app real con MongoDB, esto sería:
    //   db.collection('users').findOne({ usuario, contrasena })
    // Si usuario = {"$ne": ""} y contrasena = {"$ne": ""},
    // la consulta se convierte en: findOne({usuario: {$ne: ""}, contrasena: {$ne: ""}})

    const found = nosqlUsers.find(user => {
        const matchUser = matchNoSQL(user.usuario, usuario);
        const matchPass = matchNoSQL(user.contrasena, contrasena);
        return matchUser && matchPass;
    });

    if (found) {
        console.log(`✅ NoSQL Login exitoso: ${found.usuario} (rol: ${found.rol})`);
        req.session.usuario = found.usuario;
        return res.json({
            success: true,
            message: `¡Acceso concedido! Usuario: ${found.usuario} | Rol: ${found.rol} (NoSQL Injection exitosa)`
        });
    } else {
        console.log('❌ NoSQL Login fallido');
        return res.json({ success: false, message: 'Credenciales NoSQL incorrectas.' });
    }
});

/**
 * Simula el comportamiento de MongoDB con operadores de consulta
 */
function matchNoSQL(fieldValue, input) {
    // Si la entrada es un string normal, comparación directa
    if (typeof input === 'string') {
        return fieldValue === input;
    }

    // Si es un objeto, evalúa operadores MongoDB
    if (typeof input === 'object' && input !== null) {
        // $ne — not equal
        if (input['$ne'] !== undefined) {
            return fieldValue !== input['$ne'];
        }
        // $gt — greater than
        if (input['$gt'] !== undefined) {
            return fieldValue > input['$gt'];
        }
        // $lt — less than
        if (input['$lt'] !== undefined) {
            return fieldValue < input['$lt'];
        }
        // $gte — greater than or equal
        if (input['$gte'] !== undefined) {
            return fieldValue >= input['$gte'];
        }
        // $regex — regular expression
        if (input['$regex'] !== undefined) {
            try {
                const regex = new RegExp(input['$regex'], input['$options'] || '');
                return regex.test(fieldValue);
            } catch (e) {
                return false;
            }
        }
        // $in — value in array
        if (input['$in'] !== undefined && Array.isArray(input['$in'])) {
            return input['$in'].includes(fieldValue);
        }
        // $exists
        if (input['$exists'] !== undefined) {
            return input['$exists'] ? fieldValue !== undefined : fieldValue === undefined;
        }
        // $where — JavaScript execution (VERY DANGEROUS)
        if (input['$where'] !== undefined) {
            try {
                // Simula evaluación JS (extremadamente peligroso en MongoDB real)
                const result = eval(input['$where']);
                return !!result;
            } catch (e) {
                return false;
            }
        }
    }

    return false;
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  🚨 3. INYECCIÓN LDAP (simulada)                               ║
// ╚══════════════════════════════════════════════════════════════════╝
app.post('/ldap-login', (req, res) => {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
        return res.json({ success: false, message: 'Por favor, completa todos los campos.' });
    }

    // 🚨 VULNERABLE — concatenación directa en filtro LDAP
    const filter = `(&(uid=${usuario})(userPassword=${contrasena}))`;

    console.log('\n📁 ═══ INYECCIÓN LDAP ════════════════════════════');
    console.log('📝 Filtro LDAP:', filter);
    console.log('════════════════════════════════════════════════════\n');

    // Simula evaluación del filtro LDAP
    const found = ldapDirectory.find(entry => {
        return matchLDAP(entry, usuario, contrasena);
    });

    if (found) {
        console.log(`✅ LDAP Login exitoso: ${found.cn} (${found.uid})`);
        req.session.usuario = found.uid;
        return res.json({
            success: true,
            message: `¡Acceso LDAP concedido! CN: ${found.cn} | UID: ${found.uid} | Rol: ${found.role} (LDAP Injection exitosa)`,
            filter: filter
        });
    } else {
        console.log('❌ LDAP Login fallido');
        return res.json({ success: false, message: 'Credenciales LDAP incorrectas.', filter: filter });
    }
});

/**
 * Simula matching LDAP vulnerable
 */
function matchLDAP(entry, userInput, passInput) {
    // Wildcard matching
    if (userInput === '*' && passInput === '*') return true;
    if (userInput === '*' && entry.userPassword === passInput) return true;
    if (entry.uid === userInput && passInput === '*') return true;

    // Simula inyección con OR: si el input contiene )(| 
    if (userInput.includes(')(|') || userInput.includes('*)(')) {
        // La inyección modifica el filtro para siempre ser verdadero
        console.log('   🔓 Inyección LDAP detectada — filtro manipulado');
        return true;
    }

    // Simula inyección en contraseña
    if (passInput.includes(')(uid=') || passInput.includes('*)(')) {
        console.log('   🔓 Inyección LDAP en contraseña detectada');
        return true;
    }

    // Simula null filter injection (&))
    if (userInput.includes('(&))') || userInput.includes(')(&))')) {
        console.log('   🔓 Null LDAP filter injection detectada');
        return true;
    }

    // Comparación directa normal
    return entry.uid === userInput && entry.userPassword === passInput;
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  🚨 4. INYECCIÓN XPath                                         ║
// ╚══════════════════════════════════════════════════════════════════╝
app.post('/xpath-login', (req, res) => {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
        return res.json({ success: false, message: 'Por favor, completa todos los campos.' });
    }

    // 🚨 VULNERABLE — concatenación directa en consulta XPath
    const xpathQuery = `//user[username/text()='${usuario}' and password/text()='${contrasena}']`;

    console.log('\n📄 ═══ INYECCIÓN XPath ═══════════════════════════');
    console.log('📝 Consulta XPath:', xpathQuery);
    console.log('════════════════════════════════════════════════════\n');

    try {
        const nodes = xpath.select(xpathQuery, xmlDoc);

        if (nodes && nodes.length > 0) {
            const userNode = nodes[0];
            const username = xpath.select('string(username)', userNode);
            const role = xpath.select('string(role)', userNode);
            const email = xpath.select('string(email)', userNode);

            console.log(`✅ XPath Login exitoso: ${username} (${role})`);
            req.session.usuario = username;
            return res.json({
                success: true,
                message: `¡Acceso XPath concedido! Usuario: ${username} | Rol: ${role} | Email: ${email} (XPath Injection exitosa)`,
                query: xpathQuery
            });
        } else {
            console.log('❌ XPath Login fallido');
            return res.json({ success: false, message: 'Credenciales XPath incorrectas.', query: xpathQuery });
        }
    } catch (err) {
        console.log(`💥 Error XPath: ${err.message}`);
        return res.json({
            success: false,
            message: `Error en la consulta XPath: ${err.message}`,
            query: xpathQuery
        });
    }
});

// ╔══════════════════════════════════════════════════════════════════╗
// ║  🚨 5. INYECCIÓN GraphQL                                       ║
// ╚══════════════════════════════════════════════════════════════════╝

// Esquema GraphQL vulnerable — expone datos sensibles y tiene introspección habilitada
const schema = buildSchema(`
  type User {
    id: Int
    username: String
    password: String
    role: String
    email: String
  }

  type Config {
    key: String
    value: String
  }

  type SearchResult {
    users: [User]
    configs: [Config]
  }

  type Query {
    users: [User]
    user(id: Int!): User
    search(query: String!): SearchResult
    configs: [Config]
  }

  type Mutation {
    updateRole(userId: Int!, role: String!): User
    deleteUser(id: Int!): User
  }
`);

// Resolvers vulnerables — sin autenticación ni autorización
const graphqlRoot = {
    users: () => {
        console.log('🔍 GraphQL: Listando TODOS los usuarios (sin auth)');
        return graphqlUsers;
    },
    user: ({ id }) => {
        console.log(`🔍 GraphQL: Accediendo a usuario ID=${id} (sin auth)`);
        return graphqlUsers.find(u => u.id === id);
    },
    search: ({ query }) => {
        console.log(`🔍 GraphQL: Búsqueda "${query}" (sin filtro)`);
        const matchedUsers = graphqlUsers.filter(u =>
            u.username.includes(query) || u.role.includes(query) || u.email.includes(query)
        );
        const matchedConfigs = graphqlConfigs.filter(c =>
            c.key.toLowerCase().includes(query.toLowerCase()) || c.value.toLowerCase().includes(query.toLowerCase())
        );
        return { users: matchedUsers, configs: matchedConfigs };
    },
    configs: () => {
        console.log('🔍 GraphQL: Listando TODAS las configuraciones (sin auth)');
        return graphqlConfigs;
    },
    updateRole: ({ userId, role }) => {
        console.log(`🔍 GraphQL: Cambiando rol de usuario ${userId} a "${role}" (sin auth)`);
        const user = graphqlUsers.find(u => u.id === userId);
        if (user) {
            user.role = role;
            return user;
        }
        return null;
    },
    deleteUser: ({ id }) => {
        console.log(`🔍 GraphQL: Eliminando usuario ${id} (sin auth)`);
        const idx = graphqlUsers.findIndex(u => u.id === id);
        if (idx !== -1) {
            const deleted = graphqlUsers.splice(idx, 1)[0];
            return deleted;
        }
        return null;
    }
};

// 🚨 VULNERABLE — Introspección habilitada, sin rate limiting, sin depth limiting
app.post('/graphql', async (req, res) => {
    const { query, variables } = req.body;

    console.log('\n◈  ═══ INYECCIÓN GraphQL ═══════════════════════');
    console.log('📝 Query:', query);
    if (variables) console.log('📝 Variables:', JSON.stringify(variables));
    console.log('════════════════════════════════════════════════════\n');

    try {
        const result = await graphql({
            schema,
            source: query,
            rootValue: graphqlRoot,
            variableValues: variables
        });
        // Si la consulta devuelve datos exitosamente, crear sesión
        if (result.data && !result.errors) {
            req.session.usuario = 'graphql_hacker';
        }
        res.json(result);
    } catch (err) {
        console.log(`💥 GraphQL Error: ${err.message}`);
        res.status(400).json({ errors: [{ message: err.message }] });
    }
});

// ══════════════════════════════════════════════════════════════════════
// RUTAS AUXILIARES
// ══════════════════════════════════════════════════════════════════════

// Dashboard (página protegida)
app.get('/dashboard', (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API para obtener datos del usuario autenticado
app.get('/api/user', (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ error: 'No autenticado' });
    }
    res.json({ usuario: req.session.usuario });
});

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// ── Iniciar servidor ────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('');
    console.log('⚠️  ════════════════════════════════════════════════════════════');
    console.log('⚠️  SERVIDOR VULNERABLE — SOLO PARA FINES EDUCATIVOS');
    console.log('⚠️  ════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🧪 Laboratorio de inyecciones: http://localhost:${PORT}/lab`);
    console.log(`📊 GraphiQL IDE: http://localhost:${PORT}/graphql`);
    console.log('');
    console.log('📋 Credenciales SQL: usuario="administrador" | contraseña="pruebadeacceso1"');
    console.log('');
    console.log('🎯 Tipos de inyección disponibles:');
    console.log('');
    console.log('   1️⃣  SQL Injection      → POST /login');
    console.log('   2️⃣  NoSQL Injection     → POST /nosql-login');
    console.log('   3️⃣  LDAP Injection      → POST /ldap-login');
    console.log('   4️⃣  XPath Injection     → POST /xpath-login');
    console.log('   5️⃣  GraphQL Injection   → POST /graphql');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
});
